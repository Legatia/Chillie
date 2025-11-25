use clap::{Parser, Subcommand};
use std::net::SocketAddr;

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
    /// Start the relay service
    Start {
        /// Port to listen on
        #[arg(short, long, default_value = "8080")]
        port: u16,
    },
    /// Check node status
    Status,
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
            let addr = SocketAddr::from(([0, 0, 0, 0], *port));
            println!("Starting Chillie Relay Node on {}", addr);
            
            // Mock server
            let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
            loop {
                let (socket, _) = listener.accept().await.unwrap();
                tokio::spawn(async move {
                    println!("Accepted connection");
                    // Handle connection
                });
            }
        }
        Commands::Status => {
            println!("Checking node status...");
            // TODO: Query contract
            println!("Status: Active");
            println!("Reputation: 100");
        }
    }
}
