from sklearn.cluster import KMeans

# Simulated QC metrics
qc_data = pd.DataFrame({
    'Band_Sharpness': np.random.rand(50),
    'A260_A280_Ratio': np.random.uniform(1.5, 2.2, 50)
})

# Apply K-Means
kmeans = KMeans(n_clusters=3, n_init='auto').fit(qc_data)
qc_data['Cluster'] = kmeans.labels_

# Visualizing QC Groups
plt.figure(figsize=(8, 6))
sns.scatterplot(data=qc_data, x="Band_Sharpness", y="A260_A280_Ratio", 
                hue="Cluster", palette="viridis", s=100, style="Cluster")

# Adding a horizontal line for the "Ideal" A260/280 ratio (1.8)
plt.axhline(1.8, ls='--', color='red', alpha=0.5, label="Ideal Ratio")
plt.legend(title="QC Groups")
plt.title("Sample Quality Control Clusters")
plt.show()
