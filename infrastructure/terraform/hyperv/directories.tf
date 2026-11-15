resource "terraform_data" "lab_directories" {
  input = {
    images_dir = local.images_dir
    vms_dir    = local.vms_dir
  }

  provisioner "local-exec" {
    interpreter = ["PowerShell", "-NoProfile", "-Command"]
    command     = "New-Item -ItemType Directory -Force -Path '${local.images_dir}', '${local.vms_dir}' | Out-Null"
  }
}
