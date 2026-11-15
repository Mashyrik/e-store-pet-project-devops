resource "terraform_data" "ubuntu_server_iso" {
  triggers_replace = {
    url      = local.ubuntu_iso_url
    checksum = local.ubuntu_iso_checksum
    path     = local.ubuntu_iso_path
  }

  provisioner "local-exec" {
    interpreter = ["PowerShell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command"]
    command     = "& '${path.module}/scripts/download_verified_file.ps1' -DestinationPath '${local.ubuntu_iso_path}' -Url '${local.ubuntu_iso_url}' -Checksum '${local.ubuntu_iso_checksum}'"
  }

  depends_on = [terraform_data.lab_directories]
}
