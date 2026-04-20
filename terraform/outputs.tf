output "cloud_run_url" {
  description = "Monopoly app URL"
  value       = google_cloud_run_v2_service.monopoly_app.uri
}
