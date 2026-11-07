import hashlib, json, os, re, urllib.request
from pathlib import Path
from androguard.core.apk import APK

repo = os.environ["GITHUB_REPOSITORY"]
headers = {"Authorization": "Bearer " + os.environ["GH_TOKEN"], "Accept": "application/vnd.github+json"}
req = urllib.request.Request("https://api.github.com/repos/" + repo + "/releases/latest", headers=headers)
release = json.load(urllib.request.urlopen(req))
assets = [a for a in release["assets"] if a["name"].lower().endswith(".apk")]
if len(assets) != 1:
    raise RuntimeError("Publish exactly one APK asset before running this workflow")
asset = assets[0]
url = asset["browser_download_url"]
if not url.startswith("https://github.com/" + repo + "/releases/download/"):
    raise RuntimeError("Unexpected APK download location")
urllib.request.urlretrieve(url, "release.apk")
apk = APK("release.apk")
if apk.get_package() != "app.greyshirts.firewall":
    raise RuntimeError("Wrong application package")
code = int(apk.get_androidversion_code())
previous = json.loads(Path("update.json").read_text())
if code < int(previous.get("versionCode", 0)):
    raise RuntimeError("Refusing to downgrade update feed")
data = Path("release.apk").read_bytes()
digest = hashlib.sha256(data).hexdigest()
if code == int(previous.get("versionCode", 0)) and previous.get("sha256") not in (None, digest):
    raise RuntimeError("Changed APK needs a higher versionCode")
name = apk.get_androidversion_name()
match = re.search(r"(\d+)$", name)
notes = (release.get("body") or "New app update available.")[:4000]
feed = dict(schemaVersion=1, versionCode=code, versionName=name, releaseNumber=int(match.group(1)) if match else code, releasedAt=release["published_at"][:10], apkUrl=url, sizeBytes=len(data), sha256=digest, notes=notes, changes=[notes])
Path("update.json").write_text(json.dumps(feed, indent=2) + "\n")
