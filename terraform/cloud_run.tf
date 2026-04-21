resource "google_cloud_run_v2_service" "monopoly_app" {
  name     = "monopoly-app"
  location = var.region

  template {
    service_account = google_service_account.monopoly_app.email

    # Scale to zero when idle
    # Single-instance Socket.IO: broadcast rooms only work within one instance
    # (no Redis adapter configured). Keep max at 1 so all players hit the same pod.
    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }

    # WebSocket connections need longer timeout (1 hour)
    timeout = "3600s"

    # Session affinity: ensures same player hits same instance for Socket.IO
    session_affinity = true

    containers {
      # Updated by deploy.sh after each build
      image = "docker.io/adamva/monopoly@sha256:160225af661aed685b2b0e2e7e81b90fe3c4696f45ec6eab3d4514fd76b61fbb"

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name = "MONGODB_URI"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.monopoly_mongodb_uri.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.run,
    google_secret_manager_secret_iam_member.monopoly_mongodb_uri,
  ]
}

# Allow unauthenticated (public) access
resource "google_cloud_run_v2_service_iam_member" "monopoly_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.monopoly_app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
