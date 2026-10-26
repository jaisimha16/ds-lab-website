(function () {
  'use strict';

  var experiments = [
  {
    "id": 9,
    "name": "Case Study: Customer Personality Analysis",
    "previewVideo": null,
    "youtubeVideo": null,
    "youtubeLink": null,
    "githubLink": "https://github.com/jaisimha16",
    "summary": "Analyzes customer segments from purchasing behaviour using the K-Means clustering algorithm. Covers data collection, cleaning, exploratory analysis, clustering with the Elbow Method and Silhouette Score, segment interpretation and targeted marketing strategies.",
    "sections": [
      {
        "letter": "A",
        "title": "KMeans clustering on Mall Customers",
        "video": null,
        "code": "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nfrom sklearn.cluster import KMeans\n\nurl = \"https://raw.githubusercontent.com/selva86/datasets/master/Mall_Customers.csv\"\ndf = pd.read_csv(url)\n\nX = df[[\"Annual Income (k$)\", \"Spending Score (1-100)\"]]\n\nkmeans = KMeans(n_clusters=5, random_state=0)\ndf[\"Cluster\"] = kmeans.fit_predict(X)\n\nsns.scatterplot(data=df, x=\"Annual Income (k$)\", y=\"Spending Score (1-100)\",\n                hue=\"Cluster\", palette=\"tab10\")\nplt.title(\"Customer Segments\")\nplt.xlabel(\"Annual Income (k$)\")\nplt.ylabel(\"Spending Score\")\nplt.show()\n"
      },
      {
        "letter": "B",
        "title": "Customer personality segmentation with the Elbow Method",
        "video": null,
        "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\ndf = pd.read_csv(\"marketing_campaign.csv\", sep=\"\\t\")\n\nfeatures = [\"Income\", \"MntWines\", \"MntFruits\", \"MntMeatProducts\",\n            \"MntFishProducts\", \"MntSweetProducts\", \"MntGoldProds\"]\ndata = df[features].copy()\ndata = data.fillna(data.median())\ndata = data.clip(lower=data.quantile(0.01), upper=data.quantile(0.99), axis=1)\n\nscaler = StandardScaler()\nX = scaler.fit_transform(data)\n\ninertias, scores = [], []\nfor k in range(2, 8):\n    model = KMeans(n_clusters=k, random_state=42, n_init=10)\n    labels = model.fit_predict(X)\n    inertias.append(model.inertia_)\n    scores.append(silhouette_score(X, labels))\n\nplt.plot(range(2, 8), inertias, marker='o')\nplt.xlabel('Number of Clusters (K)')\nplt.ylabel('Inertia')\nplt.title('Elbow Method')\nplt.show()\nprint(\"Silhouette scores:\", dict(zip(range(2, 8), scores)))\n"
      }
    ]
  },
  {
    "id": 10,
    "name": "Case Study: Text Emotion Detection",
    "previewVideo": null,
    "youtubeVideo": null,
    "youtubeLink": null,
    "githubLink": "https://github.com/jaisimha16",
    "summary": "Detects the emotion expressed in a short text message and maps it to a suitable emoji. Trains a Naive Bayes classifier on a small labelled dataset using CountVectorizer, then predicts the emotion of a new message.",
    "sections": [
      {
        "letter": "A",
        "title": "Train a Naive Bayes text-emotion classifier",
        "video": null,
        "code": "from sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\n\ntexts = [\"I am happy\", \"I am angry\", \"I feel sad\", \"I love this\"]\nlabels = [\"happy\", \"angry\", \"sad\", \"happy\"]\n\nvec = CountVectorizer()\nX = vec.fit_transform(texts)\n\nmodel = MultinomialNB()\nmodel.fit(X, labels)\n\ntest = vec.transform([\"I am so sad today\"])\nprint(model.predict(test))\n"
      }
    ]
  }
];

  var modules = [
  {
    "id": 6,
    "title": "Customer Personality Analysis",
    "description": "Segmenting customers with K-Means clustering and turning the segments into marketing strategies.",
    "expIds": [
      9
    ]
  },
  {
    "id": 7,
    "title": "Text Emotion Detection",
    "description": "Detecting the emotion in a short text message with a Naive Bayes classifier and CountVectorizer.",
    "expIds": [
      10
    ]
  }
];

  var meta = {
  "9": {
    "aim": "To analyze customer data and identify different customer segments based on income, age, spending habits, purchasing behaviour and preferences, so that a business can target the right customers, improve products and increase sales while reducing marketing cost.",
    "description": "Customer Personality Analysis is a detailed analysis of a company's ideal customers. It uses data analysis and machine learning to divide customers into groups, understand each group's characteristics and design suitable marketing strategies and products.",
    "tools": [
      "Python",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Scikit-learn"
    ],
    "procedure": [
      "Collect a customer dataset with income, spending and purchase information.",
      "Clean the data: remove duplicates, handle missing values, convert dates, handle outliers.",
      "Perform exploratory data analysis on income, spending and purchase behaviour.",
      "Standardize the numerical features with StandardScaler.",
      "Use K-Means clustering, choosing K with the Elbow Method and Silhouette Score.",
      "Interpret each segment (high-value, budget-conscious, occasional, low-engagement, promotion-sensitive).",
      "Recommend a marketing strategy for each segment."
    ],
    "expectedOutput": [
      "Section A - a scatter plot of customer segments coloured by cluster.",
      "Section B - the Elbow plot of inertia versus K and the silhouette scores for K = 2 to 7."
    ],
    "result": "Customers were grouped into distinct segments based on income and spending score, and a targeted marketing strategy was recommended for each segment."
  },
  "10": {
    "aim": "To develop a machine learning model that identifies the emotion expressed in a text message and predicts the most suitable emotion category.",
    "description": "Text emotion detection is a content-based classification problem. The model learns from labelled examples using CountVectorizer for feature extraction and Multinomial Naive Bayes for classification, then predicts the emotion of a new message.",
    "tools": [
      "Python",
      "Scikit-learn",
      "CountVectorizer",
      "Multinomial Naive Bayes"
    ],
    "procedure": [
      "Prepare labelled text samples with emotion labels.",
      "Convert the text to lowercase and clean unwanted characters.",
      "Vectorize the text with CountVectorizer.",
      "Split the data into training and testing sets.",
      "Train a Multinomial Naive Bayes classifier.",
      "Predict the emotion of a new message and display the result."
    ],
    "expectedOutput": [
      "Section A - the predicted emotion label for the test message ['I am so sad today']."
    ],
    "result": "The trained classifier predicts the emotion of the test message. With more labelled data and richer features, accuracy improves."
  }
};

  var learn = {
  "9": {
    "objectives": [
      "Understand customer segmentation and why it reduces marketing cost.",
      "Clean, standardize and cluster customer data with K-Means.",
      "Choose the number of clusters using the Elbow Method and Silhouette Score.",
      "Interpret each segment and propose a targeted marketing strategy."
    ],
    "theory": "Customer Personality Analysis is a detailed analysis of a company's ideal customers. It uses data analysis and machine learning to divide customers into groups that share similar characteristics. K-Means is an unsupervised algorithm: it repeatedly assigns each customer to the nearest centroid and recomputes the centroid until the groups stabilise. The Elbow Method plots inertia against K to find a good number of clusters, and the Silhouette Score measures how well separated the clusters are. The actual segments depend on the dataset and the clustering result.",
    "algorithm": [
      "Collect a customer dataset with income, spending and purchase information.",
      "Clean the data: remove duplicates, handle missing values, convert dates, handle outliers.",
      "Select the relevant numerical features.",
      "Standardize the features so that large values do not dominate.",
      "Run K-Means for K = 2 to 7 and record inertia and silhouette score.",
      "Plot the elbow curve and choose K.",
      "Fit the final model and add a Cluster column to the DataFrame.",
      "Visualize the segments with a scatter plot.",
      "Interpret each segment and recommend a strategy."
    ],
    "flowchart": "  +----------------------------------+\n  | Collect customer dataset         |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | Clean and select features        |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | Standardize with Scaler          |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | K-Means for K=2..7               |\n  | Elbow + Silhouette               |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | Fit final model, add Cluster col |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | Scatter plot + interpret         |\n  | segments and strategies          |\n  +----------------------------------+",
    "notes": [
      {
        "section": "A",
        "text": "KMeans(n_clusters=5) groups the customers. fit_predict() both fits the model and returns the cluster label for every row. The scatter plot colours each point by its cluster."
      },
      {
        "section": "B",
        "text": "StandardScaler() gives every feature mean 0 and standard deviation 1 so that income does not dominate the smaller spending columns. The Elbow plot and Silhouette Score help choose K."
      }
    ],
    "sampleInput": "",
    "needsInput": false,
    "troubleshooting": [
      {
        "problem": "ModuleNotFoundError: No module named 'sklearn'",
        "fix": "Scikit-learn is not bundled in the browser sandbox. Install it locally with pip install scikit-learn, or use a Google Colab notebook."
      },
      {
        "problem": "FileNotFoundError: marketing_campaign.csv",
        "fix": "Download the customer personality dataset first and place it next to your script. The dataset uses a tab separator, so use pd.read_csv('marketing_campaign.csv', sep='\\t')."
      },
      {
        "problem": "KMeans produces different clusters each run",
        "fix": "Set random_state and n_init=10 so the result is reproducible."
      },
      {
        "problem": "The elbow curve has no clear elbow",
        "fix": "Try a wider range of K and also check the silhouette scores; real customer data often has no single obvious K."
      }
    ],
    "viva": [
      {
        "q": "What is K-Means clustering?",
        "a": "An unsupervised algorithm that groups data points by repeatedly assigning each point to the nearest centroid and recomputing the centroid."
      },
      {
        "q": "Why standardize the features first?",
        "a": "So that variables with large values do not dominate the distance calculation."
      },
      {
        "q": "What does the Elbow Method show?",
        "a": "Inertia versus K; the point where the curve bends is a good number of clusters."
      },
      {
        "q": "What is the Silhouette Score?",
        "a": "A measure of how well separated the clusters are; higher is better."
      },
      {
        "q": "What is an unsupervised problem?",
        "a": "A learning problem where there are no target labels; the algorithm finds structure in the data itself."
      }
    ],
    "related": [
      5,
      7
    ],
    "tutorial": {
      "searchQuery": "python KMeans customer segmentation clustering scikit-learn tutorial beginners",
      "note": "No recorded video exists in this project for this experiment, so a clearly labelled YouTube search link is provided instead."
    }
  },
  "10": {
    "objectives": [
      "Understand text emotion detection as a classification problem.",
      "Clean and vectorize text with CountVectorizer.",
      "Train a Naive Bayes classifier on labelled examples.",
      "Predict the emotion of a new text message."
    ],
    "theory": "Text emotion detection is a content-based classification problem. People express emotions through text messages, social media posts, customer reviews and online conversations. The system uses Natural Language Processing and machine learning to analyze text and predict its emotional category. CountVectorizer turns text into numeric features by counting how many times each word appears, and Multinomial Naive Bayes is a simple, fast classifier that works well on word counts.",
    "algorithm": [
      "Prepare labelled text samples with emotion labels.",
      "Convert the text to lowercase and clean unwanted characters.",
      "Vectorize the text with CountVectorizer.",
      "Split the data into training and testing sets.",
      "Train a Multinomial Naive Bayes classifier.",
      "Predict the emotion of a new message and display the result."
    ],
    "flowchart": "  +----------------------------------+\n  | Labelled text samples            |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | Clean and lowercase text         |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | CountVectorizer -> X             |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | Train MultinomialNB              |\n  +----------------+-----------------+\n                   v\n  +----------------------------------+\n  | Predict emotion of new           |\n  | text message                     |\n  +----------------------------------+",
    "notes": [
      {
        "section": "A",
        "text": "CountVectorizer() builds a vocabulary of words and turns each text into a vector of word counts. MultinomialNB() learns the probability of each word given each emotion label."
      }
    ],
    "sampleInput": "",
    "needsInput": false,
    "troubleshooting": [
      {
        "problem": "ModuleNotFoundError: No module named 'sklearn'",
        "fix": "Scikit-learn is not bundled in the browser sandbox. Install it locally with pip install scikit-learn, or run the code in Google Colab."
      },
      {
        "problem": "The prediction is always the same label",
        "fix": "The training set is tiny. Add more labelled examples so the model can learn the difference between emotions."
      },
      {
        "problem": "CountVectorizer returns an empty matrix",
        "fix": "The text may contain only stopwords or punctuation. Check that the input strings contain real words."
      }
    ],
    "viva": [
      {
        "q": "What is text emotion detection?",
        "a": "A classification problem that predicts the emotion expressed in a piece of text."
      },
      {
        "q": "What does CountVectorizer do?",
        "a": "It turns text into a matrix of word counts, one row per text and one column per word."
      },
      {
        "q": "What is Naive Bayes?",
        "a": "A simple classifier based on Bayes' theorem that assumes the features are independent."
      },
      {
        "q": "Why is Naive Bayes suitable for text?",
        "a": "It is fast, works well with word counts, and needs only a small amount of training data."
      },
      {
        "q": "How could the model be improved?",
        "a": "Use more labelled data, better features such as TF-IDF, or a pre-trained transformer such as BERT."
      }
    ],
    "related": [
      3,
      5
    ],
    "tutorial": {
      "searchQuery": "python text emotion detection naive bayes countvectorizer sklearn tutorial",
      "note": "No recorded video exists in this project for this experiment, so a clearly labelled YouTube search link is provided instead."
    }
  }
};


if (typeof LAB !== 'undefined') {
  LAB.experiments = (LAB.experiments || []).concat(experiments);
  LAB.modules = (LAB.modules || []).concat(modules);
  LAB.meta = LAB.meta || {};
  Object.keys(meta).forEach(function (k) { LAB.meta[k] = meta[k]; });
}
if (typeof LAB_LEARN !== 'undefined') {
  Object.keys(learn).forEach(function (k) { LAB_LEARN[k] = learn[k]; });
}
if (typeof window !== 'undefined') {
  window.LAB = LAB;
  window.LAB_LEARN = LAB_LEARN;
}

})();
