"""Export saved notebook cells and outputs without running any notebook code."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LOCAL_TOOLS = ROOT / ".notebook-tools"
if LOCAL_TOOLS.exists():
    sys.path.insert(0, str(LOCAL_TOOLS))

import nbformat
from nbconvert import HTMLExporter
from bs4 import BeautifulSoup

# pip --target places Jupyter's templates outside the default data directories.
template_dirs = [str(LOCAL_TOOLS / "share/jupyter/nbconvert/templates")] if LOCAL_TOOLS.exists() else []
exporter = HTMLExporter(template_name="lab", extra_template_basedirs=template_dirs, extra_template_paths=template_dirs)
exporter.exclude_input_prompt = True
exporter.exclude_output_prompt = True

for source in sorted((ROOT / "public/notebooks").glob("*.ipynb")):
    notebook = nbformat.read(source, as_version=4)
    html, _ = exporter.from_notebook_node(notebook, resources={"metadata": {"name": source.stem}})
    soup = BeautifulSoup(html, "html.parser")
    # Static editions: remove script loaders that the iframe sandbox blocks anyway.
    for script in soup.find_all("script"):
        script.decompose()
    style = soup.new_tag("style")
    style.string = "body{padding:12px!important}#notebook-container{padding:0!important}.jp-Notebook{padding:8px!important}.jp-Cell{padding-left:0!important;padding-right:0!important}img{max-width:100%;height:auto}"
    soup.head.append(style)
    target = source.with_suffix(".html")
    target.write_text(str(soup), encoding="utf-8")
    print(f"{target.name}: {len(notebook.cells)} cells exported")
