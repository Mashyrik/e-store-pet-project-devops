resource "docker_network" "e_store" {
  name = "e-store-network"
}

resource "docker_volume" "postgres_data" {
  name = "e-store-postgres-data"
}

resource "docker_image" "app" {
  name         = "e-store:terraform"
  keep_locally = true

  build {
    context    = "${path.module}/../../.."
    dockerfile = "Dockerfile"
  }
}

resource "docker_image" "postgres" {
  name         = "postgres:17"
  keep_locally = true
}

resource "docker_container" "postgres" {
  name         = "e-store-postgres"
  image        = docker_image.postgres.image_id
  restart      = "unless-stopped"
  wait         = true
  wait_timeout = 60


  env = [
    "POSTGRES_DB=${var.db_name}",
    "POSTGRES_USER=${var.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}"
  ]

  networks_advanced {
    name = docker_network.e_store.name
  }

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U ${var.db_user} -d ${var.db_name}"]
    interval = "10s"
    timeout  = "5s"
    retries  = 5
  }
}

resource "docker_container" "app" {
  name    = "e-store-terraform"
  image   = docker_image.app.image_id
  restart = "unless-stopped"

  env = [
    "DB_URL=jdbc:postgresql://${docker_container.postgres.name}:5432/${var.db_name}",
    "DB_USER=${var.db_user}",
    "DB_PASSWORD=${var.db_password}",
    "JWT_SECRET=${var.jwt_secret}",
    "JWT_EXPIRATION_MS=${var.jwt_expiration_ms}"
  ]

  networks_advanced {
    name = docker_network.e_store.name
  }

  ports {
    internal = 8080
    external = var.app_host_port
    ip       = "127.0.0.1"
    protocol = "tcp"
  }
}