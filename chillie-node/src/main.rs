mod walrus;
mod shelby;
mod signaling;

use clap::{Parser, Subcommand};
use std::net::SocketAddr;
use std::path::Path;

#[derive(Parser)]
#[command(name = "chillie-node")]
#[command(about = "Chillie Node Contributor CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Register this node with the Chillie contract
    Register {
        /// The address to advertise (e.g., 127.0.0.1:8080)
        #[arg(short, long)]
        address: String,
        
        /// Path to the wallet/keyfile (placeholder)
        #[arg(short, long)]
        keyfile: Option<String>,
    },
    /// Start the relay service (Standard)
    Start {
        /// Port to listen on
        #[arg(short, long, default_value = "8080")]
        port: u16,
    },
    /// Start the relay service in Shelby Mode (High Performance)
    StartShelby {
        /// Aptos address for rewards
        #[arg(short, long)]
        aptos_address: String,
        /// Region code (e.g., us-east, eu-central)
        #[arg(short, long, default_value = "global")]
        region: String,
    },
    /// Check node status
    Status,
    /// Upload a recording to Walrus (Cold Storage)
    Upload {
        /// Path to the file to upload
        #[arg(short, long)]
        file: String,
    },
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Register { address, keyfile } => {
            println!("Registering node at address: {}", address);
            println!("Keyfile: {:?}", keyfile);
            // TODO: Implement contract call
            println!("Node registered successfully! (Mock)");
        }
        Commands::Start { port } => {
            signaling::start_signaling_server(*port).await;
        }
        Commands::StartShelby { aptos_address, region } => {
            println!("Initializing Shelby High-Performance Relay...");
            let client = shelby::ShelbyClient::new(aptos_address.clone(), region.clone());
            
            match client.connect().await {
                Ok(status) => {
                    println!("✅ Connected to Shelby Mesh!");
                    println!("Latency: {}ms", status.latency_ms);
                    println!("Aptos Address: {}", aptos_address);
                    println!("Region: {}", region);
                    println!("Waiting for high-bandwidth streams...");
                    
                    // Keep alive
                    loop {
                        tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
                    }
                }
                Err(e) => {
                    eprintln!("Failed to connect to Shelby: {}", e);
                }
            }
        }
        Commands::Status => {
            println!("Checking node status...");
            // TODO: Query contract
            println!("Status: Active");
            println!("Reputation: 100");
        }
        Commands::Upload { file } => {
            println!("Uploading file to Walrus: {}", file);
            let client = walrus::WalrusClient::new();
            match client.store_file(Path::new(file)).await {
                Ok(blob_id) => {
                    println!("Successfully uploaded to Walrus!");
                    println!("Blob ID: {}", blob_id);
                }
                Err(e) => {
                    eprintln!("Failed to upload file: {}", e);
                }
            }
        }
    }
}
