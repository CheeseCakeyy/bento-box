# Kaggle notebook editions

The nine original `.ipynb` files and their generated HTML editions live here. The portfolio embeds the HTML in a sandboxed iframe; it does not execute Python or notebook JavaScript. Static plots and tables work; interactive widgets requiring scripts do not.

Use these basenames (one `.ipynb` and one `.html` per notebook):

- irrigation-needs
- seed-averaging
- exploring-cosmos
- f1-pit-stops
- churn-prediction
- convnets-mnist
- cyber-physical-anomaly
- heart-disease
- housing-prices

To regenerate all HTML editions after updating a notebook, run `python scripts/export_notebooks.py` from `portfolio_ui`. The converter uses `nbconvert`, `nbformat` and `beautifulsoup4` (installed locally in the ignored `.notebook-tools` directory). On a new machine, install these with `python -m pip install --target .notebook-tools nbconvert`. The script retains saved outputs, does not execute notebook code, removes scripts, and reduces export padding for the inline reader.

`app/work/HallOfFame.tsx` derives each file pair from the notebook slug:

```ts
preview: "/notebooks/irrigation-needs.html",
source: "/notebooks/irrigation-needs.ipynb",
```

All nine previews and original downloads are connected. Titles, votes, medals, and competition ranks came from the supplied screenshots; leaderboard context came from the author. Individual Kaggle notebook URLs were not supplied, so the profile link remains available.

Everything in this folder is publicly downloadable. Check notebook sources and saved outputs for credentials or private data before adding them.
