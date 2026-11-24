#!/usr/bin/env bash
# Hackathon Codespace tools: the Google Cloud CLI (gcloud) and pdftotext, plus the Cline preset. Run on create, and again on start if either tool is missing.
set -euo pipefail
bash "$(dirname "$0")/cline-defaults.sh" || echo "Cline preset failed; Cline will ask for the key and model" >&2
# Drop any expired Yarn apt source before running apt-get update.
sudo rm -f /etc/apt/sources.list.d/yarn.list

pids=()
if ! command -v pdftotext >/dev/null || [ ! -x /usr/sbin/sshd ]; then
  (
    export DEBIAN_FRONTEND=noninteractive
    sudo apt-get update -qq
    sudo apt-get install -y -qq --no-install-recommends poppler-utils openssh-server lsof
    sudo mkdir -p /var/run/sshd
    sudo sed -i 's/session\s*required\s*pam_loginuid\.so/session optional pam_loginuid.so/g' /etc/pam.d/sshd
    sudo sed -i -E 's/#*\s*Port\s+.+/Port 2222/g' /etc/ssh/sshd_config
  ) &
  pids+=("$!")
fi
if ! command -v gcloud >/dev/null; then
  (
    sudo rm -rf /usr/local/share/google-cloud-sdk
    curl -fsSL https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz \
      | sudo tar -xz -C /usr/local/share
    sudo ln -sf /usr/local/share/google-cloud-sdk/bin/gcloud \
      /usr/local/share/google-cloud-sdk/bin/gsutil \
      /usr/local/share/google-cloud-sdk/bin/bq \
      /usr/local/bin/
  ) &
  pids+=("$!")
fi
for pid in "${pids[@]}"; do
  wait "$pid"
done
sudo /etc/init.d/ssh status >/dev/null 2>&1 || sudo /etc/init.d/ssh start >/dev/null 2>&1 || true
echo "✓ Hackathon codespace ready: $(gcloud --version | head -1)"
