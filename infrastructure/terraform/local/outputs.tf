output "application_url" {
  description = "URL of the e-store application"
  value       = "http://localhost:${var.app_host_port}"
}

output "readiness_url" {
  description = "Spring Boot readiness endpoint"
  value       = "http://localhost:${var.app_host_port}/actuator/health/readiness"
}

output "network_name" {
  description = "Docker network managed by Terraform"
  value       = docker_network.e_store.name
}

output "postgres_container_name" {
  description = "PostgreSQL container managed by Terraform"
  value       = docker_container.postgres.name
}