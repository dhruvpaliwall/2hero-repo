FROM mcr.microsoft.com/devcontainers/python:1-3.12-bookworm
LABEL org.opencontainers.image.source="https://github.com/2hero-electrolux/hackathon-template"
RUN export DEBIAN_FRONTEND=noninteractive \
 && rm -f /etc/apt/sources.list.d/yarn.list \
 && apt-get update -qq \
 && apt-get install -y -qq --no-install-recommends poppler-utils openssh-server lsof \
 && mkdir -p /var/run/sshd \
 && sed -i 's/session\s*required\s*pam_loginuid\.so/session optional pam_loginuid.so/g' /etc/pam.d/sshd \
 && sed -i -E 's/#*\s*Port\s+.+/Port 2222/g' /etc/ssh/sshd_config \
 && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz \
    | tar -xz -C /usr/local/share \
 && ln -sf /usr/local/share/google-cloud-sdk/bin/gcloud \
           /usr/local/share/google-cloud-sdk/bin/gsutil \
           /usr/local/share/google-cloud-sdk/bin/bq \
           /usr/local/bin/
