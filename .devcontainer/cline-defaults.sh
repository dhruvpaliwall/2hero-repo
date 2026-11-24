#!/usr/bin/env bash
# Preset Cline (extension 4.1.26) to OpenRouter with anthropic/claude-opus-5.5 (allowed by the team key's
# guardrail), skip its welcome screen, and fill in the team key from the OPENROUTER_API_KEY Codespaces secret when
# the repo has one. Also configure ~/.ssh/elx-l4 and Host elx-l4 (plus elx-l4-2 to elx-l4-5, same key and login)
# from the ELX_L4_SSH_KEY / ELX_L4_HOST / ELX_L4_USER Codespaces secrets for the team's own login on the five
# shared L4 GPU VMs, and point gcloud at the
# team's own GCP project in europe-north1. Runs on create and start.
set -euo pipefail
python3 - <<'PY'
import configparser, json, os, re
data = os.path.expanduser("~/.cline/data")
model = "anthropic/claude-opus-5.5"
key = os.environ.get("OPENROUTER_API_KEY", "")

def load(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}

def save(path, obj, mode=0o644):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd = os.open(path + ".tmp", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, mode)
    with os.fdopen(fd, "w") as f:
        json.dump(obj, f)
    os.replace(path + ".tmp", path)

state_path = os.path.join(data, "globalState.json")
state = load(state_path)
for m in ("planMode", "actMode"):
    state.setdefault(m + "ApiProvider", "openrouter")
    if state.get(m + "OpenRouterModelId") in (None, "", "openai/gpt-5.5", "google/gemini-4-argon"):
        state[m + "OpenRouterModelId"] = model
if key:
    state["welcomeViewCompleted"] = True
save(state_path, state)

providers_path = os.path.join(data, "settings", "providers.json")
providers = load(providers_path) or {"version": 1, "modes": {}, "providers": {}}
providers["lastUsedProvider"] = "openrouter"
entry = providers.setdefault("providers", {}).setdefault("openrouter", {"tokenSource": "manual"})
settings = entry.setdefault("settings", {"provider": "openrouter"})
if settings.get("model") in (None, "", "openai/gpt-5.5", "google/gemini-4-argon"):
    settings["model"] = model
if key:
    settings["apiKey"] = key
save(providers_path, providers, 0o600)

if key:
    secrets_path = os.path.join(data, "secrets.json")
    secrets = load(secrets_path)
    secrets["openRouterApiKey"] = key
    save(secrets_path, secrets, 0o600)

print("✓ Cline: OpenRouter", model, "key from secret" if key else "key not set: paste it from your 2hero page")

l4_key = os.environ.get("ELX_L4_SSH_KEY", "").strip()
l4_host = os.environ.get("ELX_L4_HOST", "").strip() or "34.64.208.22"
repo_slug = os.environ.get("GITHUB_REPOSITORY", "").split("/")[-1].strip() or os.path.basename(os.getcwd())
l4_user = os.environ.get("ELX_L4_USER", "").strip() or (repo_slug if repo_slug.startswith("team-") else "")
if l4_key and l4_user:
    ssh_dir = os.path.expanduser("~/.ssh")
    os.makedirs(ssh_dir, mode=0o700, exist_ok=True)
    os.chmod(ssh_dir, 0o700)
    for kname in ("elx-l4", "elx_l4"):
        key_path = os.path.join(ssh_dir, kname)
        fd = os.open(key_path + ".tmp", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(l4_key + "\n")
        os.replace(key_path + ".tmp", key_path)
    cfg_path = os.path.join(ssh_dir, "config")
    try:
        with open(cfg_path) as f:
            cfg = f.read()
    except OSError:
        cfg = ""
    l4_hosts = [
        ("elx-l4", l4_host),
        ("elx-l4-2", "34.22.111.208"),
        ("elx-l4-3", "34.47.102.45"),
        ("elx-l4-4", "34.64.135.100"),
        ("elx-l4-5", "34.158.204.232"),
    ]
    for alias, host in l4_hosts:
        block = (
            f"Host {alias}\n"
            f"  HostName {host}\n"
            f"  User {l4_user}\n"
            "  IdentityFile ~/.ssh/elx-l4\n"
            "  IdentitiesOnly yes\n"
            "  StrictHostKeyChecking accept-new\n"
        )
        cfg = re.sub(r"(?ms)^Host " + re.escape(alias) + r"\n(?:[ \t]+[^\n]*\n)*", "", cfg)
        if cfg and not cfg.endswith("\n"):
            cfg += "\n"
        cfg += block
    fd = os.open(cfg_path + ".tmp", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(cfg)
    os.replace(cfg_path + ".tmp", cfg_path)
    print(f"✓ Shared L4 GPUs: ssh elx-l4, elx-l4-2, elx-l4-3, elx-l4-4 or elx-l4-5 (as {l4_user})")

team_projects = {
    "team-canvas": "tohero-elx-canvas-4997",
    "team-capture": "tohero-elx-capture-1cbe",
    "team-electrolux-01": "tohero-elx-electrolux-01-e1dc",
    "team-flow": "tohero-elx-flow-e001",
    "team-focus": "tohero-elx-focus-af5d",
    "team-frame": "tohero-elx-frame-9002",
    "team-fusion": "tohero-elx-fusion-f120",
    "team-imagine": "tohero-elx-imagine-ebbc",
    "team-lens": "tohero-elx-lens-c7b2",
    "team-motion": "tohero-elx-motion-434b",
    "team-orbit": "tohero-elx-orbit-50c1",
    "team-pixel": "tohero-elx-pixel-d0a1",
    "team-prism": "tohero-elx-prism-840f",
    "team-pulse": "tohero-elx-pulse-3dbb",
    "team-reel": "tohero-elx-reel-627c",
    "team-render": "tohero-elx-render-1a16",
    "team-scene": "tohero-elx-scene-cd68",
    "team-spark": "tohero-elx-spark-fad2",
    "team-spectrum": "tohero-elx-spectrum-5921",
    "team-studio": "tohero-elx-studio-8df8",
    "team-vector": "tohero-elx-vector-9fae",
    "team-vision": "tohero-elx-vision-f376",
    "team-vivid": "tohero-elx-vivid-3f71",
}
gcp_project = os.environ.get("ELX_GCP_PROJECT", "").strip() or team_projects.get(repo_slug, "")
if gcp_project:
    gcloud_dir = os.path.expanduser("~/.config/gcloud")
    cfgs_dir = os.path.join(gcloud_dir, "configurations")
    os.makedirs(cfgs_dir, mode=0o700, exist_ok=True)
    active_path = os.path.join(gcloud_dir, "active_config")
    with open(active_path, "w") as f:
        f.write("default")
    cfg_file = os.path.join(cfgs_dir, "config_default")
    cp = configparser.ConfigParser()
    cp.read(cfg_file)
    if not cp.has_section("core"):
        cp.add_section("core")
    if cp.get("core", "project", fallback="") in ("", "tohero-elx-hackathon"):
        cp.set("core", "project", gcp_project)
    if not cp.has_section("compute"):
        cp.add_section("compute")
    if not cp.get("compute", "region", fallback=""):
        cp.set("compute", "region", "europe-north1")
    with open(cfg_file, "w") as f:
        cp.write(f)
    print(f"✓ Team GCP project: {gcp_project} (europe-north1)")
PY
