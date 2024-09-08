use anyhow::Ok;
use plonky2::field::goldilocks_field::GoldilocksField;
use plonky2::hash::hash_types::HashOut;
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};
use plonky2::plonk::proof::{Proof, ProofWithPublicInputs};
use plonky2::{field::types::Field, hash::poseidon::PoseidonHash, plonk::config::Hasher};
use rocket::serde;
use rocket::{http::Status, response::status::Custom};
use rocket::serde::{Deserialize, json::Json};
mod zk;

#[macro_use] extern crate rocket;

const D: usize = 2;
type C = PoseidonGoldilocksConfig;
type F = <C as GenericConfig<D>>::F;

#[derive(Deserialize)]
#[serde(crate="rocket::serde")]
struct api_proof {
    pub username: u64,
    pub proof: String,
    pub pub_inputs: Vec<String>
}

#[get("/generate-proof/<username>/<password>")]
async fn generate_proof_endpoint(username: u64, password: String) -> Result<String, Custom<String>> {
    
    let mut bytes = password.as_bytes().to_vec();
    bytes.resize(16, 0);

    let mut result = Vec::with_capacity(2);
    for chunk in bytes.chunks(8) {
        let mut buffer = [0u8; 8];
        for (i, &byte) in chunk.iter().enumerate() {
            buffer[i] = byte;
        }
        result.push(u64::from_le_bytes(buffer));
    }

    let mut hashes = vec![];
    for byt in result.iter(){
        hashes.push(PoseidonHash::hash_no_pad(&[Field::from_canonical_u64(*byt)]));
    }

    let inp = [Field::from_canonical_u64(result[0]), Field::from_canonical_u64(result[1])];
    println!("{:?}", inp);
    let user = PoseidonHash::hash_no_pad(&[Field::from_canonical_u64(username)]);
    match zk::generate_proof(inp, hashes, user) {
        std::result::Result::Ok(res) => std::result::Result::Ok(res),
        Err(e) => Err(Custom(Status::InternalServerError, "false".to_string()))
    }
}


#[post("/verify-proof", data="<user_proof>")]
async fn verify_proof_endpoint(user_proof: Json<api_proof>) -> Result<String, Custom<String>> {
    match zk::verify_login_proof(user_proof.proof.clone(), user_proof.pub_inputs.clone().into_iter().filter_map(|s| s.parse::<u64>().ok()).collect(), user_proof.username.clone()) {
        std::result::Result::Ok(res) => std::result::Result::Ok(res.to_string()),
        Err(e) => Err(Custom(Status::InternalServerError,"false".to_string()))
    }
}

#[get("/get-pass-hash/<password>")]
async fn get_pass_hash(password: String) -> Result<String, Custom<String>>{

    println!("{:?}", password);

    let mut bytes = password.as_bytes().to_vec();
    bytes.resize(16, 0);

    let mut result = Vec::with_capacity(2);
    for chunk in bytes.chunks(8) {
        let mut buffer = [0u8; 8];
        for (i, &byte) in chunk.iter().enumerate() {
            buffer[i] = byte;
        }
        result.push(u64::from_le_bytes(buffer));
    }

    let mut hashes: Vec<HashOut<GoldilocksField>> = vec![];
    for byt in result.iter(){
        hashes.push(PoseidonHash::hash_no_pad(&[Field::from_canonical_u64(*byt)]));
    }

    let mut op: Vec<String> = vec![];
    for i in 0..2{
        for j in hashes[i].elements.iter().enumerate(){
            op.push(j.1.to_string());
        }
    }

    match serde_json::to_string(&op){
        std::result::Result::Ok(e) => std::result::Result::Ok(e),
        Err(e) => Err(Custom(Status::InternalServerError,"false".to_string()))
    }
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![generate_proof_endpoint, verify_proof_endpoint, get_pass_hash])
}