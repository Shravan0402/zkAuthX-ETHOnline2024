use std::{fs::File, io::{BufReader, Write}};

use anyhow::{Error, Ok, Result};
use plonky2::{field::{goldilocks_field::GoldilocksField, types::Field}, hash::{hash_types::{HashOut, HashOutTarget}, poseidon::PoseidonHash}, iop::{target::Target, witness::{PartialWitness, WitnessWrite}}, plonk::{circuit_builder::CircuitBuilder, circuit_data::CircuitConfig, config::{self, GenericConfig, Hasher, PoseidonGoldilocksConfig}, proof::{Proof, ProofWithPublicInputs}}};

const D: usize = 2;
type C = PoseidonGoldilocksConfig;
type F = <C as GenericConfig<D>>::F;

pub fn generate_proof(inp: [F;2], op:Vec<HashOut<GoldilocksField>>, user: HashOut<GoldilocksField>) -> Result<String, Error>{

    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F,D>::new(config);

    let inputs: [Target; 2] = builder.add_virtual_target_arr();
    let outputs = builder.add_virtual_hashes(2);
    let username = builder.add_virtual_hash();


    for i in 0..2{
        let hash = builder.hash_n_to_hash_no_pad::<PoseidonHash>([inputs[i]].to_vec());
        builder.connect_hashes(hash, outputs[i]);
    }

    builder.register_public_inputs(&outputs[0].elements);
    builder.register_public_inputs(&outputs[1].elements);
    builder.register_public_inputs(&username.elements);

    let mut pw = PartialWitness::new();
    pw.set_target_arr(&inputs, &inp);
    pw.set_hash_target(outputs[0], op[0]);
    pw.set_hash_target(outputs[1], op[1]);
    pw.set_hash_target(username, user);

    let data = builder.build::<C>();
    let mut proof = data.prove(pw)?;
    proof.public_inputs = vec![];
    let mut json_data = serde_json::to_string(&proof)?;
    let mut file = File::create("proof.json")?;
    file.write_all(json_data.as_bytes())?;
    
    Ok(json_data)
}

pub fn verify_login_proof(proof: String, pub_inputs: Vec<u64>, pub_username: u64) -> Result<bool, Error>{
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F,D>::new(config);

    let inputs: [Target; 2] = builder.add_virtual_target_arr();
    let outputs = builder.add_virtual_hashes(2);
    let username = builder.add_virtual_hash();

    for i in 0..2{
        let hash = builder.hash_n_to_hash_no_pad::<PoseidonHash>([inputs[i]].to_vec());
        builder.connect_hashes(hash, outputs[i]);
    }

    builder.register_public_inputs(&outputs[0].elements);
    builder.register_public_inputs(&outputs[1].elements);
    builder.register_public_inputs(&username.elements);
    let data = builder.build::<C>();

    let file = File::open("proof.json")?;
    let reader = BufReader::new(file);
    let mut proof:ProofWithPublicInputs<F,C,D> = serde_json::from_reader(reader)?;
    proof.public_inputs = pub_inputs.iter().map(|num| F::from_canonical_u64(*num)).collect();
    proof.public_inputs.extend(PoseidonHash::hash_no_pad(&[F::from_canonical_u64(pub_username)]).elements);
    
    data.verify(proof)?;

    Ok(true)
}

#[test]
fn test_verification() -> Result<(), Error>{
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F,D>::new(config);

    let inputs: [Target; 2] = builder.add_virtual_target_arr();
    let outputs = builder.add_virtual_hashes(2);
    let username = builder.add_virtual_hash();

    for i in 0..2{
        let hash = builder.hash_n_to_hash_no_pad::<PoseidonHash>([inputs[i]].to_vec());
        builder.connect_hashes(hash, outputs[i]);
    }

    builder.register_public_inputs(&outputs[0].elements);
    builder.register_public_inputs(&outputs[1].elements);
    builder.register_public_inputs(&username.elements);
    let data = builder.build::<C>();

    let file = File::open("proof.json")?;
    let reader = BufReader::new(file);
    let proof:ProofWithPublicInputs<F,C,D> = serde_json::from_reader(reader)?;
    // proof.public_inputs = pub_inputs.iter().map(|num| F::from_canonical_u64(*num)).collect();
    // proof.public_inputs.extend(PoseidonHash::hash_no_pad(&[F::from_canonical_u64(pub_username)]).elements);
    // println!("Built");
    // let json_data = serde_json::to_string(&proof)?;
    // let mut file = File::create("ver-proof.json")?;
    // file.write_all(json_data.as_bytes())?;
    data.verify(proof)
}