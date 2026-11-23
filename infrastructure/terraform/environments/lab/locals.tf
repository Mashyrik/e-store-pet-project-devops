locals {
  images_dir = "${var.lab_root}/images"
  seeds_dir  = "${var.lab_root}/seeds"
  vms_dir    = "${var.lab_root}/vms"
  vm_dir     = "${local.vms_dir}/${var.vm_name}"

  ssh_internal_port         = 22
  application_internal_port = 8080
}