use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;

const WALRUS_AGGREGATOR_URL: &str = "https://aggregator.walrus-testnet.walrus.space";
const WALRUS_PUBLISHER_URL: &str = "https://publisher.walrus-testnet.walrus.space";

#[derive(Debug, Serialize, Deserialize)]
pub struct StoreBlobResponse {
    pub newly_created: Option<BlobInfo>,
    pub already_certified: Option<BlobInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlobInfo {
    pub blob_object_id: String,
    pub encoded_size: u64,
    pub cost: u64,
}

pub struct WalrusClient {
    client: reqwest::Client,
    publisher_url: String,
}

impl WalrusClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            publisher_url: WALRUS_PUBLISHER_URL.to_string(),
        }
    }

    pub async fn store_file(&self, file_path: &Path) -> Result<String> {
        let file_bytes = tokio::fs::read(file_path).await?;
        
        let response = self.client
            .put(format!("{}/v1/store", self.publisher_url))
            .body(file_bytes)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Failed to store blob: {}", response.status()));
        }

        let store_response: StoreBlobResponse = response.json().await?;
        
        let blob_id = if let Some(info) = store_response.newly_created {
            info.blob_object_id
        } else if let Some(info) = store_response.already_certified {
            info.blob_object_id
        } else {
            return Err(anyhow::anyhow!("No blob info returned"));
        };

        Ok(blob_id)
    }
}
