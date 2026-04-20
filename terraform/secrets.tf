# Dedicated service account for Monopoly Cloud Run
resource "google_service_account" "monopoly_app" {
  account_id   = "monopoly-app-sa"
  display_name = "Monopoly App Service Account"

  depends_on = [google_project_service.iam]
}

# Secret: MongoDB URI (separate from finance-app's mongodb-uri)
resource "google_secret_manager_secret" "monopoly_mongodb_uri" {
  secret_id = "monopoly-mongodb-uri"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "monopoly_mongodb_uri" {
  secret      = google_secret_manager_secret.monopoly_mongodb_uri.id
  secret_data = var.mongodb_uri
}

# Grant service account access to the secret
resource "google_secret_manager_secret_iam_member" "monopoly_mongodb_uri" {
  secret_id = google_secret_manager_secret.monopoly_mongodb_uri.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.monopoly_app.email}"
}
