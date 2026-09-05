# Kaggle notebook editions

Place the original `.ipynb` files here, alongside static HTML exports with saved outputs. The portfolio embeds the HTML in a sandboxed iframe; it does not execute Python or notebook JavaScript. Static plots and tables work; interactive widgets requiring scripts do not.

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

Export with Jupyter's HTML export or `jupyter nbconvert --to html --template lab public/notebooks/irrigation-needs.ipynb`. Do not execute the notebook during export; retain its saved outputs.

After adding each file pair, set the matching entry in `app/work/HallOfFame.tsx`:

```ts
preview: "/notebooks/irrigation-needs.html",
source: "/notebooks/irrigation-needs.ipynb",
```

Only enable a path once its file exists. Until then, the notebook shows a clear preview-coming-soon state with a link to the Kaggle notebook profile. Screenshots supplied titles, vote counts, medals, and competition ranks, but contained no notebook contents or individual URLs. No contents or individual links have been invented.

Everything in this folder is publicly downloadable. Check notebook sources and saved outputs for credentials or private data before adding them.
