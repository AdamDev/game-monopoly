resource "google_storage_bucket" "monopoly_avatars" {
  name          = "${var.project_id}-monopoly-avatars"
  location      = "EU"
  force_destroy = false

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket_iam_member" "monopoly_avatars_public_read" {
  bucket = google_storage_bucket.monopoly_avatars.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
