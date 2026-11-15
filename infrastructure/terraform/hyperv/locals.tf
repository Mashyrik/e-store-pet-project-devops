locals {
  lab_root   = "C:/Users/skmtt/HyperV/e-store-lab"
  images_dir = "${local.lab_root}/images"
  vms_dir    = "${local.lab_root}/vms"

  ubuntu_iso_url      = "https://releases.ubuntu.com/24.04.5/ubuntu-24.04.5-live-server-amd64.iso"
  ubuntu_iso_checksum = "97f3d7ffb032c3eb3b23d2c8be9cc76e60c2c1f2c0146ba5ba9fe01cafae0fd8"
  ubuntu_iso_path     = "${local.images_dir}/ubuntu-24.04.5-live-server-amd64.iso"
}
