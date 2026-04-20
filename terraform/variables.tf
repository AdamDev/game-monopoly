variable "project_id" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  default     = "europe-west1"
  description = "GCP region (Belgium — supports domain mappings)"
}

variable "mongodb_uri" {
  type        = string
  sensitive   = true
  description = "MongoDB Atlas connection URI for monopoly database"
}
