import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

# Simulating CNN output: Probability of a variant across a genomic window
genomic_positions = np.arange(100, 200)
variant_probs = np.random.dirichlet(np.ones(100), size=1).flatten()

sns.set_theme(style="whitegrid")
plt.figure(figsize=(12, 4))

# Visualizing the 'Signal' the CNN detected
plot = sns.lineplot(x=genomic_positions, y=variant_probs, color="crimson", linewidth=2)
plot.fill_between(genomic_positions, variant_probs, color="crimson", alpha=0.3)

plt.title("CNN Variant Probability Map")
plt.xlabel("Genomic Position (bp)")
plt.ylabel("Probability Score")
plt.show()
