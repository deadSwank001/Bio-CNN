import pandas as pd
from sklearn.linear_model import LinearRegression

# Simulated data: Band Intensity vs. Known Concentration (ng/uL)
data = pd.DataFrame({
    'Intensity': [120, 250, 480, 610, 890, 1100],
    'Concentration': [10, 20, 50, 65, 90, 115]
})

plt.figure(figsize=(8, 6))

# sns.regplot performs the linear regression and plots the 95% confidence interval
sns.regplot(data=data, x="Intensity", y="Concentration", 
            scatter_kws={"s": 100, "color": "teal"}, 
            line_kws={"color": "orange"})

plt.title("Quantification Macro: Intensity vs. Concentration")
plt.show()
