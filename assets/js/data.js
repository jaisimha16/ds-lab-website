/* =====================================================================
   data.js  —  THE ONLY FILE YOU NEED TO EDIT
   ---------------------------------------------------------------------
   Everything shown on the site comes from this file:

     LAB.brand        laboratory name and subject code
     LAB.student      the ID card on the home page (photo, name, id ...)
     LAB.experiments  every experiment, its videos, links, summary and
                      its sections (A, B, C ... — as many as you add)

   Each experiment:
   ---------------------------------------------------------------------
   {
     id: 1,                              // number, also used in the URL
     name: "Experiment name",
     previewVideo: "assets/video/exp1-preview.mp4",   // hover preview
     youtubeVideo: "abc123XYZ",          // YouTube video ID (or null)
     youtubeLink: "https://youtu.be/abc123XYZ",       // shown as a link
     githubLink: "https://github.com/...",            // repository link
     summary: "Summary of Experiment",
     sections: [
       { letter: "A", title: "Section title",
         video: "assets/video/exp1-a.mp4",
         code: "import pandas as pd\n..." },
       { letter: "B", ... }              // add as many sections as needed
     ]
   }

   Adding a new experiment: copy a whole { ... } block inside
   LAB.experiments, change the values, save. Nothing else to touch.
   ===================================================================== */
var LAB = {
  "brand": {
    "laboratory": "Data Science Digital Library",
    "subjectCode": "22DS102006"
  },
  "student": {
    "photo": "assets/img/student-j14.png",
    "name": "Satharu Jayasimha Reddy",
    "idNumber": "24102A030110",
    "section": "2",
    "branch": "CSE (Data Science)",
    "faculty": "S.Bosu Babu",
    "profession": "Assistant Professor",
    "subjectCode": "22DS102006",
    "university": "Mohan Babu University",
    "github": "https://github.com/jaisimha16",
    "instagram": "https://www.instagram.com/jai_simha__14/?hl=en"
  },
  "experiments": [
    {
      "id": 1,
      "name": "Import and Export in CSV, JSON and Excel Formats",
      "previewVideo": "assets/video/exp1-preview.mp4",
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "Reads an existing CSV into pandas, then builds a small student table in memory and writes it back out as CSV, JSON and Excel. Each half of the experiment ends by reading the file it just produced, so the output is verified rather than assumed. It also shows where the row index sneaks into a file and how to stop that.",
      "sections": [
        {
          "letter": "A",
          "title": "Read a CSV file and inspect it",
          "video": "assets/video/exp1-a.mp4",
          "code": "import pandas as pd\nimport openpyxl\n\ndf=pd.read_csv('car_dataset_40x20.csv')\nprint(df.head())\n\ndf.shape\n\ndf.columns\n"
        },
        {
          "letter": "B",
          "title": "Write a DataFrame to CSV and read it back",
          "video": "assets/video/exp1-b.mp4",
          "code": "import pandas as pd\n\nStudent_data={\n    \"Roll_no\":[10,11,12,13],\n    \"name\":[\"Ganesh\",\"mani\",\"nithin\",\"Chandhu\"],\n    \"Dept\":[\"CSE\",\"IT\",\"ECE\",\"CSE\"],\n}\ndf=pd.DataFrame(Student_data)\ndf\ndf.to_csv(\"Student_output.txt\")\nprint(\"Succes\")\ndf\nnf=pd.read_csv(\"Student_output.txt\")\nnf\ndf.columns\n"
        },
        {
          "letter": "C",
          "title": "Export to JSON and read it back",
          "video": "assets/video/exp1-c.mp4",
          "code": "import pandas as pd\n\nStudent_data={\n    \"Roll_no\":[10,11,12,13],\n    \"name\":[\"Ganesh\",\"mani\",\"nithin\",\"Chandhu\"],\n    \"Dept\":[\"CSE\",\"IT\",\"ECE\",\"CSE\"],\n}\ndf=pd.DataFrame(Student_data)\ndf.to_json(\"Students.json\",orient='records',indent=4)\nprint(\"JSon file created\")\ndf=pd.read_json('Students.json')\nprint(\"Student Data\")\ndf\n"
        },
        {
          "letter": "D",
          "title": "Export to Excel and read it back",
          "video": "assets/video/exp1-d.mp4",
          "code": "import pandas as pd\n\nStudent_data={\n    \"Roll_no\":[10,11,12,13],\n    \"name\":[\"Ganesh\",\"mani\",\"nithin\",\"Chandhu\"],\n    \"Dept\":[\"CSE\",\"IT\",\"ECE\",\"CSE\"],\n}\ndf=pd.DataFrame(Student_data)\ndf.to_excel(\"Student.xlsx\",sheet_name=\"Student details\",index=False)\nprint(\"Data written succesfully in excel\")\ndf=pd.read_excel(\"Student.xlsx\",sheet_name=\"Student details\")\nprint(\"Data from excel file\")\ndf\n"
        }
      ]
    },
    {
      "id": 2,
      "name": "Web Data Retrieval and SQLite Storage",
      "previewVideo": "assets/video/exp2-preview.mp4",
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "Two halves that cover both ends of a data pipeline. Part A calls the pandas GitHub issues endpoint and turns the JSON response into a table. Part B creates an SQLite table, inserts rows, reads them through pandas, then updates and deletes, finishing with commit so the file on disk actually changes.",
      "sections": [
        {
          "letter": "A",
          "title": "Fetch a REST endpoint with requests",
          "video": "assets/video/exp2-a.mp4",
          "code": "import requests\nimport pandas as pd\nimport sqlite3\n\nurl='https://api.github.com/repos/pandas-dev/pandas/issues'\nresponses=requests.get(url)\nissues=responses.json()\ndf_issues=pd.DataFrame(issues)\nprint(df_issues[['id','title','state']].head())\n"
        },
        {
          "letter": "B",
          "title": "Create, query, update and delete in SQLite",
          "video": "assets/video/exp2-b.mp4",
          "code": "import requests\nimport pandas as pd\nimport sqlite3\n\nconn=sqlite3.connect(\"Students.db\")\ncursor=conn.cursor()\ncursor.execute(\"CREATE TABLE IF NOT EXISTS Students (id INTEGER,name TEXT)\")\ncursor.execute(\"INSERT INTO Students VALUES(1,'ganesh')\")\nconn.commit()\ncursor.execute(\"INSERT INTO Students VALUES(2,'mani')\")\nconn.commit()\ndf=pd.read_sql_query(\"SELECT * FROM Students\",conn)\nprint(df)\ncursor.execute(\"DELETE FROM Students WHERE id=1\")\ncursor.execute(\"UPDATE Students SET name ='Alice' where id=1\")\nconn.commit()\nconn.commit()\nconn.close()\n"
        }
      ]
    },
    {
      "id": 3,
      "name": "Missing Values, Encoding, Outliers and Regular Expressions",
      "previewVideo": "assets/video/exp3-preview.mp4",
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "Four independent cleaning tasks on pandas. Missing values are detected with isna and then either dropped or filled. A text column is mapped to numbers with .map. Random data is scanned for values beyond +/-3 sigma. Finally a raw string is split on whitespace using a regular expression.",
      "sections": [
        {
          "letter": "A",
          "title": "Find, drop and fill missing values",
          "video": "assets/video/exp3-a.mp4",
          "code": "import numpy as np\nimport pandas as pd\n\ndata={'A':[1,2,np.nan],'B':[4,np.nan,np.nan]}\ndf=pd.DataFrame(data)\nprint(df.isna())\ndf_clean=df.dropna()\ndf_filled=df.fillna(0)\nprint()\nprint(df_clean)\nprint()\nprint(df_filled)\n"
        },
        {
          "letter": "B",
          "title": "Encode a text column and rename columns",
          "video": "assets/video/exp3-b.mp4",
          "code": "import pandas as pd\n\ndf=pd.DataFrame({'gender':['male','female']})\ndf['gender_num']=df['gender'].map({'male':1,'female':0})\ndf_renamed=df.rename(columns={'gender':'Gender'})\nprint(df_renamed)\n"
        },
        {
          "letter": "C",
          "title": "Detect outliers with a threshold",
          "video": "assets/video/exp3-c.mp4",
          "code": "import numpy as np\nimport pandas as pd\n\ndata=pd.DataFrame(np.random.randn(100,3))\noutliers=(data>3)|(data<-3)\nprint(outliers.sum())\ndata\n"
        },
        {
          "letter": "D",
          "title": "Split a string with a regular expression",
          "video": "assets/video/exp3-d.mp4",
          "code": "import re\n\ntxt=\"this is \\t a \\n test\"\nsplit_txt=re.split(r'\\st',txt)\nprint(split_txt)\n"
        }
      ]
    },
    {
      "id": 4,
      "name": "MultiIndex, Reshaping and Combining DataFrames",
      "previewVideo": "assets/video/exp4-preview.mp4",
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "Three ways of reshaping data that is already in pandas. A MultiIndex is built from two label arrays and used to select both whole groups and single cells. A two-level table is pivoted out with unstack and folded back with stack. Two frames with different keys are joined with an outer merge and then filled column by column using combine_first.",
      "sections": [
        {
          "letter": "A",
          "title": "Build a MultiIndex Series and select from it",
          "video": "assets/video/exp4-a.mp4",
          "code": "import pandas as pd\nindex = [\n    ['Engineering','Engineering','Science','Science'],\n    ['CSE','ECE','Physics','Chemistry']\n]\nmulti_index = pd.MultiIndex.from_arrays(index,names=['Department','Branch'])\nmarks = pd.Series([85,78,92,88],index=multi_index)\nprint(\"Original Series:\")\nprint(marks)\nprint(\"\\nData for Engineering:\")\nprint(marks.loc['Engineering'])\nprint(\"\\nData for CSE:\")\nprint(marks.loc[('Engineering', 'CSE')])\nprint(\"\\nData for Science:\")\nprint(marks.loc['Science'])\n"
        },
        {
          "letter": "B",
          "title": "Reshape with unstack and stack",
          "video": "assets/video/exp4-b.mp4",
          "code": "import pandas as pd\nindex = pd.MultiIndex.from_tuples(\n    [\n        ('Engineering','CSE'),\n        ('Engineering','ECE'),\n        ('Science','Physics'),\n        ('Science','Chemistry')\n    ],\n    names=['Department','Branch']\n)\n\ndata = pd.DataFrame(\n    {\n        '2025':[85,78,92,88],\n        '2026':[90,82,95,91]\n    },\n    index=index\n)\nprint(\"Original Tabular Data:\")\nprint(data)\nunstacked_data = data.unstack()\nprint(\"\\nData after Unstack():\")\nprint(unstacked_data)\nstacked_data = unstacked_data.stack()\nprint(\"\\nData after Stack():\")\nprint(stacked_data)\n"
        },
        {
          "letter": "C",
          "title": "Join two frames with outer merge and combine_first",
          "video": "assets/video/exp4-c.mp4",
          "code": "import pandas as pd\ndf1 = pd.DataFrame(\n    {\n        'Name':['Ravi','Sita','Arun'],\n        'Marks':[85,None,78],\n        'Grade':['A','B',None]\n    },\n    index=[101,102,103]\n)\n\ndf2 = pd.DataFrame(\n    {\n        'Name':['Ravi','Sita','Kiran'],\n        'Marks': [90,88,82],\n        'Grade': [None,'A','B']\n    },\n    index=[101,102,104]\n)\nprint(\"First DataFrame:\")\nprint(df1)\nprint(\"\\nSecond DataFrame:\")\nprint(df2)\nmerged = pd.merge(\n    df1,\n    df2,\n    left_index=True,\n    right_index=True,\n    how='outer',\n    suffixes=('_DF1', '_DF2')\n)\nprint(\"\\nMerged DataFrame:\")\nprint(merged)\ncombined = df1.combine_first(df2)\nprint(\"\\nDataFrame after combine_first():\")\nprint(combined)\n"
        }
      ]
    },
    {
      "id": 5,
      "name": "Data Visualisation with Matplotlib and Seaborn",
      "previewVideo": "assets/video/exp5-preview.mp4",
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "The longest experiment and the one that produced the most output. It loads the Iris dataset from a public URL and prints its shape, dtypes and describe block, then draws five different views of it. The remaining parts build grouped and stacked bar charts, a histogram paired with a density curve, a scatter plot with its correlation coefficient, and a box plot comparing three departments.",
      "sections": [
        {
          "letter": "A",
          "title": "Load Iris, inspect it, and draw five plots",
          "video": "assets/video/exp5-a.mp4",
          "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n# Load online dataset\nurl = \"https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv\"\ndf = pd.read_csv(url)\n# Display first five records\nprint(\"First Five Records:\")\nprint(df.head())\n# Display dataset information\nprint(\"\\nDataset Information:\")\nprint(df.info())\n# Display statistical summary\nprint(\"\\nStatistical Summary:\")\nprint(df.describe())\n# ---------------------------------------------------\n# 1. Matplotlib-Line Plot\n# ---------------------------------------------------\nplt.figure(figsize=(8,5))\nplt.plot(df.index,df[\"sepal_length\"],label=\"Sepal Length\")\nplt.plot(df.index,df[\"petal_length\"],label=\"Petal Length\")\nplt.xlabel(\"Sample Index\")\nplt.ylabel(\"Length\")\nplt.title(\"Sepal Length and Petal Length\")\nplt.legend()\nplt.grid()\nplt.show()\n# ---------------------------------------------------\n# 2. Seaborn-Scatter Plot\n# ---------------------------------------------------\nplt.figure(figsize=(8,5))\nsns.scatterplot(\n    data=df,\n    x=\"sepal_length\",\n    y=\"petal_length\",\n    hue=\"species\"\n)\nplt.title(\"Sepal Length vs Petal Length\")\nplt.xlabel(\"Sepal Length\")\nplt.ylabel(\"Petal Length\")\nplt.show()\n# ---------------------------------------------------\n# 3. Seaborn-Histogram\n# ---------------------------------------------------\nplt.figure(figsize=(8, 5))\nsns.histplot(\n    data=df,\n    x=\"sepal_length\",\n    hue=\"species\",\n    kde=True\n)\nplt.title(\"Distribution of Sepal Length\")\nplt.xlabel(\"Sepal Length\")\nplt.ylabel(\"Frequency\")\nplt.show()\n# ---------------------------------------------------\n# 4. Seaborn-Box Plot\n# ---------------------------------------------------\nplt.figure(figsize=(8, 5))\nsns.boxplot(\n    data=df,\n    x=\"species\",\n    y=\"petal_length\"\n)\nplt.title(\"Petal Length by Species\")\nplt.xlabel(\"Species\")\nplt.ylabel(\"Petal Length\")\nplt.show()\n# ---------------------------------------------------\n# 5. Seaborn-Pair Plot\n# ---------------------------------------------------\nsns.pairplot(\n    df,\n    hue=\"species\"\n)\nplt.show()\n"
        },
        {
          "letter": "B",
          "title": "Two stacked axes with annotations, saved to PNG",
          "video": "assets/video/exp5-b.mp4",
          "code": "import matplotlib.pyplot as plt\nmonths=[\"Jan\",\"Feb\",\"Mar\",\"Apr\",\"May\",\"Jun\"]\nsales=[120,150,180,160,220,250]\nexpenses=[80,100,120,110,140,160]\nfig,ax=plt.subplots(2,1,figsize=(10,8))\nax[0].plot(months,sales,marker=\"o\",linewidth=2,label=\"Sales\")\nax[0].set_title(\"Monthly Sales\")\nax[0].set_xlabel(\"Month\")\nax[0].set_ylabel(\"Sales\")\nax[0].set_xticks(range(len(months)))\nax[0].set_xticklabels(months)\nax[0].annotate(\"Highest Sales\",xy=(5,250),xytext=(3.5,270),arrowprops=dict(arrowstyle=\"->\"))\nax[0].legend()\nax[0].grid(True)\nax[1].plot(months,expenses,marker=\"s\",linewidth=2,label=\"Expenses\")\nax[1].set_title(\"Monthly Expenses\")\nax[1].set_xlabel(\"Month\")\nax[1].set_ylabel(\"Expenses\")\nax[1].set_xticks(range(len(months)))\nax[1].set_xticklabels(months)\nax[1].annotate(\"Highest Expense\",xy=(5,160),xytext=(3.5,180),arrowprops=dict(arrowstyle=\"->\"))\nax[1].legend()\nax[1].grid(True)\nfig.suptitle(\"Monthly Sales and Expenses Analysis\",fontsize=16)\nplt.tight_layout()\nplt.savefig(\"monthly_sales_expenses.png\",dpi=300,bbox_inches=\"tight\")\nplt.show()\n"
        },
        {
          "letter": "C",
          "title": "Grouped bar chart straight from a DataFrame",
          "video": "assets/video/exp5-c.mp4",
          "code": "import pandas as pd\nimport matplotlib.pyplot as plt\ndata={\n'Python':[85,90,78,88],\n'Java':[75,82,80,85],\n'C++':[80,76,85,90]\n}\ndf=pd.DataFrame(data,index=['Student1','Student2','Student3','Student4'])\nprint(\"DataFrame:\")\nprint(df)\ndf.plot(kind='bar',figsize=(8,5))\nplt.title(\"Student Marks in Different Programming Languages\")\nplt.xlabel(\"Students\")\nplt.ylabel(\"Marks\")\nplt.xticks(rotation=0)\nplt.legend(title=\"Subjects\")\nplt.tight_layout()\nplt.show()\n"
        },
        {
          "letter": "D",
          "title": "Stacked bar chart",
          "video": "assets/video/exp5-d.mp4",
          "code": "import pandas as pd\nimport matplotlib.pyplot as plt\ndata={\n'Python':[85,90,78,88],\n'Java':[75,82,80,85],\n'C++':[80,76,85,90]\n}\ndf=pd.DataFrame(data,index=['Student1','Student2','Student3','Student4'])\nprint(\"DataFrame:\")\nprint(df)\ndf.plot(kind='bar',stacked=True,figsize=(8,5))\nplt.title(\"Stacked Bar Plot of Student Marks\")\nplt.xlabel(\"Students\")\nplt.ylabel(\"Total Marks\")\nplt.xticks(rotation=0)\nplt.legend(title=\"Subjects\")\nplt.tight_layout()\nplt.show()\n"
        },
        {
          "letter": "E",
          "title": "Histogram and density curve",
          "video": "assets/video/exp5-e.mp4",
          "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\ndata=[45,50,52,55,58,60,62,65,68,70,72,75,78,80,82,85,88,90,92,95]\ndf=pd.DataFrame({'Marks':data})\nprint(\"Observed Data:\")\nprint(df)\nplt.figure(figsize=(8,5))\nsns.histplot(df['Marks'],bins=6,kde=False)\nplt.title(\"Histogram of Marks\")\nplt.xlabel(\"Marks\")\nplt.ylabel(\"Frequency\")\nplt.tight_layout()\nplt.show()\nplt.figure(figsize=(8,5))\nsns.kdeplot(df['Marks'],fill=True)\nplt.title(\"Density Plot of Marks\")\nplt.xlabel(\"Marks\")\nplt.ylabel(\"Density\")\nplt.tight_layout()\nplt.show()\n"
        },
        {
          "letter": "F",
          "title": "Scatter plot and correlation coefficient",
          "video": "assets/video/exp5-f.mp4",
          "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nstudy_hours=[1,2,3,4,5,6,7,8,9,10]\nmarks=[45,50,55,60,65,70,72,80,85,90]\ndf=pd.DataFrame({'Study_Hours':study_hours,'Marks':marks})\nprint(\"Data:\")\nprint(df)\nplt.figure(figsize=(8,5))\nplt.scatter(df['Study_Hours'],df['Marks'])\nplt.title(\"Relationship Between Study Hours and Marks\")\nplt.xlabel(\"Study Hours\")\nplt.ylabel(\"Marks\")\nplt.grid(True)\nplt.tight_layout()\nplt.show()\ncorrelation=df['Study_Hours'].corr(df['Marks'])\nprint(\"\\nCorrelation Coefficient:\",round(correlation,2))\n"
        },
        {
          "letter": "G",
          "title": "Box plot comparing three departments",
          "video": "assets/video/exp5-g.mp4",
          "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\ndata={\n'Department':['CSE','CSE','CSE','CSE','CSE','ECE','ECE','ECE','ECE','ECE','EEE','EEE','EEE','EEE','EEE'],\n'Marks':[78,85,90,72,88,65,70,82,75,80,60,68,72,76,85]\n}\ndf=pd.DataFrame(data)\nprint(\"Data:\")\nprint(df)\nplt.figure(figsize=(8,5))\nsns.boxplot(x='Department',y='Marks',data=df)\nplt.title(\"Marks Distribution by Department\")\nplt.xlabel(\"Department\")\nplt.ylabel(\"Marks\")\nplt.grid(axis='y',linestyle='--',alpha=0.5)\nplt.tight_layout()\nplt.show()\n"
        }
      ]
    }

  ],

  /* =====================================================================
     modules — the five course modules the experiments are organised into.
     Each module lists the ids of the experiments that belong to it, so the
     experiment data above never has to change when the grouping changes.
     ===================================================================== */
  "modules": [
    { "id": 1, "title": "Data File Handling",
      "description": "Reading and writing data in CSV, JSON and Excel formats with pandas, and verifying every file by reading it back.",
      "expIds": [1] },
    { "id": 2, "title": "Web Data & Databases",
      "description": "Fetching live data from a web API and storing, querying, updating and deleting it in an SQLite database.",
      "expIds": [2] },
    { "id": 3, "title": "Data Cleaning & Preprocessing",
      "description": "Handling missing values, encoding text columns, detecting outliers and cleaning strings with regular expressions.",
      "expIds": [3] },
    { "id": 4, "title": "Data Manipulation & Reshaping",
      "description": "MultiIndex selection, stacking and unstacking tables, and combining multiple DataFrames into one.",
      "expIds": [4] },
    { "id": 5, "title": "Data Visualisation",
      "description": "Building line, scatter, histogram, bar, stacked bar, density and box plots with Matplotlib and Seaborn.",
      "expIds": [5] }
  ],

  /* =====================================================================
     materials — the actual module study files in the modules/ folder.
     One entry per PDF: its title, file path, page count and the chapter
     titles in order (chapter N starts on PDF page N+1, used for the
     embedded PDF viewer jump links). The originals are never modified.
     ===================================================================== */
  "materials": [
    {
      "id": 1,
      "title": "Types of Data Analysis",
      "file": "modules/DS1.pdf",
      "pages": 30,
      "description": "A structured learning module covering the major approaches used to understand, explain, predict, and support decisions from data.",
      "chapters": [
        "Introduction to Data Analysis",
        "Major Types of Data Analysis",
        "Descriptive Data Analysis",
        "Diagnostic Data Analysis",
        "Exploratory Data Analysis (EDA)",
        "Inferential Data Analysis",
        "Predictive Data Analysis",
        "Prescriptive Data Analysis",
        "Qualitative Data Analysis",
        "Quantitative Data Analysis",
        "Univariate Analysis",
        "Bivariate Analysis",
        "Multivariate Analysis",
        "Statistical Analysis",
        "Time-Series Analysis",
        "Correlation Analysis",
        "Regression Analysis",
        "Classification Analysis",
        "Cluster Analysis",
        "Factor and Dimensionality Analysis",
        "Causal Data Analysis",
        "Diagnostic and Root-Cause Techniques",
        "Text and Sentiment Analysis",
        "Spatial and Geospatial Analysis",
        "Real-Time and Streaming Analysis",
        "Data Analysis Tools",
        "Data Cleaning and Preparation",
        "Choosing the Right Analysis Method",
        "Communicating Data Analysis Results & Summary, Best Practices and Review"
      ]
    },
    {
      "id": 2,
      "title": "Extracting Meaning from Data",
      "file": "modules/DS2.pdf",
      "pages": 30,
      "description": "A comprehensive study module covering data interpretation, context, data quality, descriptive statistics, visualization, patterns, relationships, qualitative and text analysis, segmentation, causal reasoning, prediction, decision-making, communication, and ethics.",
      "chapters": [
        "Introduction to Extracting Meaning from Data",
        "Data, Information, Knowledge and Insight",
        "Asking the Right Analytical Question",
        "Understanding Context and Domain Knowledge",
        "Understanding Data Types and Their Meaning",
        "Data Quality and Reliability",
        "Data Cleaning and Preparation",
        "Organizing and Structuring Data",
        "Descriptive Statistics for Meaning",
        "Comparing Groups and Benchmarks",
        "Finding Trends Over Time",
        "Detecting Patterns and Relationships",
        "Visualization as a Meaning-Extraction Tool",
        "Choosing the Right Chart and Avoiding Misleading Visuals",
        "Understanding Distributions",
        "Outliers, Anomalies and Exceptional Events",
        "Missing Data and What It Can Mean",
        "Statistical Significance and Practical Meaning",
        "Sampling and Generalization",
        "Extracting Meaning from Qualitative Data",
        "Text Analysis and Natural Language",
        "Segmentation and Hidden Group Differences",
        "From Pattern to Insight",
        "Causal Thinking and Evidence",
        "Predictive Insights and Forecasting",
        "Turning Insights into Decisions",
        "Communicating Insights Clearly",
        "Ethical and Responsible Interpretation",
        "Summary, Best Practices and Review"
      ]
    },
    {
      "id": 3,
      "title": "Feature Selection and Decision Tree Foundations",
      "file": "modules/DS3.pdf",
      "pages": 30,
      "description": "A comprehensive module covering feature types, feature selection methods, redundancy, feature engineering, leakage, validation, decision-tree structure, splitting criteria, classification and regression trees, pruning, complexity, interpretation, evaluation, and practical workflows.",
      "chapters": [
        "Introduction to Feature Selection and Decision Trees",
        "Machine Learning Features and Data Preparation",
        "Why Feature Selection Is Important",
        "Filter Methods for Feature Selection",
        "Wrapper Methods for Feature Selection",
        "Embedded Methods for Feature Selection",
        "Correlation, Redundancy and Multicollinearity",
        "Univariate and Statistical Feature Selection",
        "Mutual Information and Nonlinear Relationships",
        "Feature Importance and Model-Based Ranking",
        "Feature Engineering Before Selection",
        "Feature Selection and Data Leakage",
        "Train, Validation and Test Sets",
        "Decision Tree: Basic Structure",
        "How a Decision Tree Makes Splits",
        "Classification Trees and Gini Impurity",
        "Entropy and Information Gain",
        "Regression Trees",
        "Stopping Rules and Tree Complexity",
        "Overfitting and Underfitting in Trees",
        "Pruning Decision Trees",
        "Decision Tree Feature Importance",
        "Decision Rules and Interpretability",
        "Advantages and Limitations of Decision Trees",
        "Comparing Feature Selection Methods",
        "Practical Feature Selection Workflow",
        "Practical Decision Tree Workflow",
        "Evaluating Decision Trees",
        "Final Review, Best Practices and Learning Outcomes"
      ]
    },
    {
      "id": 4,
      "title": "Ensemble Learning",
      "file": "modules/DS4.pdf",
      "pages": 28,
      "description": "A comprehensive module covering ensemble foundations, bagging, bootstrap sampling, random forests, out-of-bag error, boosting, AdaBoost, gradient boosting, modern boosting libraries, voting, stacking, blending, diversity, evaluation, tuning, explainability, applications, and practical workflows.",
      "chapters": [
        "Introduction to Ensemble Learning",
        "Why Combine Multiple Models?",
        "Bias, Variance and the Ensemble Advantage",
        "Base Learners in Ensembles",
        "Bagging: Bootstrap Aggregating",
        "Bootstrap Sampling in Detail",
        "Random Forest: Foundation",
        "Random Forest Feature Randomness",
        "Out-of-Bag Error",
        "Boosting: Core Idea",
        "AdaBoost",
        "Gradient Boosting",
        "Learning Rate and Number of Estimators",
        "Gradient Boosting Tree Depth and Subsampling",
        "XGBoost, LightGBM and Modern Gradient Boosting",
        "Voting Ensembles",
        "Stacking and Meta-Learning",
        "Blending and Model Averaging",
        "Bagging vs Boosting",
        "Ensemble Diversity",
        "Ensemble Evaluation",
        "Hyperparameter Tuning for Ensembles",
        "Overfitting, Regularization and Generalization",
        "Feature Importance and Explainability in Ensembles",
        "Applications of Ensemble Learning",
        "Practical Ensemble Learning Workflow",
        "Final Summary, Best Practices and Review"
      ]
    },
    {
      "id": 5,
      "title": "Dimensionality Reduction",
      "file": "modules/DS5.pdf",
      "pages": 32,
      "description": "A detailed academic explanation of why high-dimensional data is difficult to analyze, how dimensionality reduction works, major linear and nonlinear methods, practical workflows, evaluation, and common mistakes.",
      "chapters": [
        "Introduction to Dimensionality Reduction",
        "The Curse of Dimensionality",
        "Goals and Types of Dimensionality Reduction",
        "Data Preparation Before Reduction",
        "Feature Scaling and Standardization",
        "Principal Component Analysis: Basic Idea",
        "PCA Mathematics and Geometry",
        "PCA Workflow",
        "Explained Variance and Component Selection",
        "PCA Interpretation and Loadings",
        "Singular Value Decomposition and PCA",
        "Linear Discriminant Analysis for Reduction",
        "Factor Analysis",
        "Kernel PCA and Nonlinear Reduction",
        "t-SNE: Concept and Purpose",
        "UMAP: Uniform Manifold Approximation and Projection",
        "PCA vs t-SNE vs UMAP",
        "Random Projection",
        "Autoencoders for Dimensionality Reduction",
        "Manifold Learning",
        "Dimensionality Reduction for Image Data",
        "Dimensionality Reduction for Text Data",
        "Dimensionality Reduction for Clustering",
        "Dimensionality Reduction for Classification and Regression",
        "Choosing the Number of Dimensions",
        "Reconstruction Error and Information Loss",
        "Outliers, Noise, and Robust Reduction",
        "Data Leakage and Dimensionality Reduction",
        "Comparing Feature Selection and Dimensionality Reduction",
        "Practical Workflow for Dimensionality Reduction",
        "Evaluation, Best Practices, and Final Review"
      ]
    }
  ],

  /* =====================================================================
     meta — extra detail shown on the experiment page (aim, procedure,
     expected output and result) plus the tools/libraries each experiment
     uses. Keyed by experiment id. Nothing here overwrites the experiment
     data above; it only adds to it.
     ===================================================================== */
  "meta": {
    "1": {
      "aim": "To import data from and export data to CSV, JSON and Excel files using the pandas library, and to verify every file by reading it back.",
      "description": "The experiment starts by reading an existing CSV file into pandas and inspecting its structure. It then builds a small student table in memory and writes it back out as a CSV, a JSON file and an Excel workbook. Each half ends by reading the file that was just produced, so the output is verified rather than assumed.",
      "tools": ["Python", "Pandas", "openpyxl"],
      "procedure": [
        "Import pandas and openpyxl.",
        "Read car_dataset_40x20.csv with pd.read_csv and inspect it using head(), shape and columns.",
        "Build an in-memory DataFrame of student records.",
        "Write the DataFrame to a CSV file and read it back to verify.",
        "Export the DataFrame to JSON with orient='records' and read it back.",
        "Export the DataFrame to an Excel sheet using openpyxl and read it back."
      ],
      "expectedOutput": [
        "Section A — the first five rows, the shape and the column names of the car dataset are printed.",
        "Section B — the in-memory table is written to Student_output.txt and read back.",
        "Section C — Students.json is created and its records are printed.",
        "Section D — Student.xlsx is created and its contents are printed."
      ],
      "result": "Data was successfully imported from and exported to CSV, JSON and Excel formats, and every exported file was read back to confirm its contents."
    },
    "2": {
      "aim": "To retrieve data from a web API using the requests library and to store, query, update and delete records in an SQLite database.",
      "description": "Two halves that cover both ends of a small data pipeline. Part A calls the pandas GitHub issues endpoint and turns the JSON response into a table. Part B creates an SQLite table, inserts rows, reads them through pandas, then updates and deletes records and commits so the file on disk actually changes.",
      "tools": ["Python", "Requests", "Pandas", "SQLite"],
      "procedure": [
        "Send a GET request to the pandas GitHub issues REST endpoint using requests.",
        "Convert the JSON response into a DataFrame and display the id, title and state columns.",
        "Connect to an SQLite database and create a Students table.",
        "Insert records and commit the transaction.",
        "Query the table with pandas.read_sql_query to verify the rows.",
        "Update and delete rows, commit, and close the connection."
      ],
      "expectedOutput": [
        "Section A — the first five issues (id, title, state) from the GitHub API are printed.",
        "Section B — the Students table is printed after inserts; the update and delete statements then change the stored rows."
      ],
      "result": "Live data was fetched from a web API into a DataFrame, and records were persisted, queried, updated and deleted in an SQLite database."
    },
    "3": {
      "aim": "To clean tabular data by handling missing values, encoding categorical text, detecting outliers and applying regular expressions.",
      "description": "Four independent cleaning tasks on pandas. Missing values are detected with isna and then either dropped or filled. A text column is mapped to numbers with .map. Random data is scanned for values beyond +/-3 sigma. Finally a raw string is split on whitespace using a regular expression.",
      "tools": ["Python", "NumPy", "Pandas", "re"],
      "procedure": [
        "Build a small DataFrame that contains NaN values.",
        "Detect the missing values with isna, then drop them and fill them.",
        "Encode a text column to numbers using .map and rename the columns.",
        "Generate random data and flag values outside the +/-3 threshold as outliers.",
        "Split a raw string on whitespace using re.split with a regular expression."
      ],
      "expectedOutput": [
        "Section A — a True/False mask of the missing values, followed by the dropped and filled frames.",
        "Section B — the gender column encoded to 0/1 and the renamed frame.",
        "Section C — the count of outliers in each column.",
        "Section D — the string split into a list of words."
      ],
      "result": "The dataset was cleaned by dropping and filling missing values, encoding text columns, flagging outliers and splitting strings with regular expressions."
    },
    "4": {
      "aim": "To build hierarchical (MultiIndex) data, reshape DataFrames with stack and unstack, and combine multiple DataFrames with merge and combine_first.",
      "description": "Three ways of reshaping data that is already in pandas. A MultiIndex is built from two label arrays and used to select both whole groups and single cells. A two-level table is pivoted out with unstack and folded back with stack. Two frames with different keys are joined with an outer merge and then filled column by column with combine_first.",
      "tools": ["Python", "Pandas"],
      "procedure": [
        "Build a MultiIndex Series from Department and Branch label arrays.",
        "Select whole groups and single cells from the MultiIndex Series.",
        "Reshape a two-level DataFrame with unstack, then fold it back with stack.",
        "Join two DataFrames that have different keys using an outer merge.",
        "Fill the gaps in the joined frame with combine_first."
      ],
      "expectedOutput": [
        "Section A — the MultiIndex Series and the selections for Engineering, CSE and Science.",
        "Section B — the original table, the unstacked table and the stacked result.",
        "Section C — the two input frames, the outer merge and the combine_first result."
      ],
      "result": "Hierarchical indexes were created and queried, DataFrames were reshaped with stack and unstack, and two frames with different keys were combined successfully."
    },
    "5": {
      "aim": "To visualise data using Matplotlib and Seaborn by drawing line, scatter, histogram, bar, stacked bar, density and box plots.",
      "description": "The longest experiment and the one that produced the most output. It loads the Iris dataset from a public URL and prints its shape, dtypes and describe block, then draws five different views of it. The remaining parts build grouped and stacked bar charts, a histogram paired with a density curve, a scatter plot with its correlation coefficient, and a box plot comparing three departments.",
      "tools": ["Python", "Pandas", "Matplotlib", "Seaborn"],
      "procedure": [
        "Load the Iris dataset from a public URL and inspect it.",
        "Draw line, scatter, histogram and box plots with Matplotlib and Seaborn.",
        "Build a two-axis figure with annotations and save it to PNG.",
        "Create grouped and stacked bar charts from a DataFrame.",
        "Plot a histogram and a density curve, then a scatter plot with its correlation.",
        "Compare departments with a box plot."
      ],
      "expectedOutput": [
        "Section A — the Iris head, info and describe output, followed by five plots.",
        "Section B — a saved monthly_sales_expenses.png with two annotated axes.",
        "Section C/D — a grouped bar chart and a stacked bar chart of student marks.",
        "Section E — a histogram and a density plot of marks.",
        "Section F — a scatter plot with the correlation coefficient printed.",
        "Section G — a box plot of marks by department."
      ],
      "result": "The data was visualised successfully with Matplotlib and Seaborn using line, scatter, histogram, bar, stacked bar, density and box plots."
    }
  },

  /* =====================================================================
     tools — the Data Science tools and Python libraries used across the
     experiments, grouped into categories for the Tools page.
     ===================================================================== */
  "tools": [
    {
      "category": "Data Analysis",
      "items": [
        { "name": "NumPy", "icon": "🔢", "color": "#4D77CF",
          "explanation": "NumPy is used for numerical computing, arrays, matrices and mathematical operations on large datasets.",
          "mainUse": "Fast array maths and vectorised operations.",
          "example": "Generate random data and compute means and standard deviations for outlier detection.",
          "url": "https://numpy.org/doc/" },
        { "name": "Pandas", "icon": "🐼", "color": "#150458",
          "explanation": "Pandas is used for data manipulation, cleaning, analysis and working with CSV, Excel, JSON and database tables.",
          "mainUse": "Loading, cleaning, reshaping and analysing tabular data.",
          "example": "Read a CSV, fill missing values and export the cleaned frame to Excel.",
          "url": "https://pandas.pydata.org/docs/" }
      ]
    },
    {
      "category": "Visualization",
      "items": [
        { "name": "Matplotlib", "icon": "📊", "color": "#11557C",
          "explanation": "Matplotlib is used to create graphs, charts and visualizations such as line charts, bar charts, histograms and scatter plots.",
          "mainUse": "Building fully customisable plots and figures.",
          "example": "Plot study hours against marks and annotate the highest value.",
          "url": "https://matplotlib.org/" },
        { "name": "Seaborn", "icon": "🎨", "color": "#4C72B0",
          "explanation": "Seaborn is a Python visualization library built on Matplotlib for statistical graphs and attractive data visualizations.",
          "mainUse": "Statistical plots such as box plots, histograms with KDE and heatmaps.",
          "example": "Draw a box plot comparing marks across departments.",
          "url": "https://seaborn.pydata.org/" },
        { "name": "Plotly", "icon": "📈", "color": "#3F4F75",
          "explanation": "Plotly is used to create interactive charts, graphs and dashboards that can be explored in the browser.",
          "mainUse": "Interactive visualisations and dashboards.",
          "example": "Build a hoverable scatter plot or a dashboard of linked charts.",
          "url": "https://plotly.com/python/" }
      ]
    },
    {
      "category": "Machine Learning",
      "items": [
        { "name": "Scikit-learn", "icon": "🤖", "color": "#F7931E",
          "explanation": "Scikit-learn is used for machine learning algorithms such as classification, regression, clustering, preprocessing, model evaluation and train-test splitting.",
          "mainUse": "Training, evaluating and tuning machine learning models.",
          "example": "Split data into train and test sets and fit a classifier.",
          "url": "https://scikit-learn.org/" }
      ]
    },
    {
      "category": "Deep Learning",
      "items": [
        { "name": "TensorFlow", "icon": "🧠", "color": "#FF6F00",
          "explanation": "TensorFlow is a deep learning framework used to build and train neural networks and large machine learning models.",
          "mainUse": "Deep learning and neural network training.",
          "example": "Train a neural network to classify images.",
          "url": "https://www.tensorflow.org/" },
        { "name": "PyTorch", "icon": "🔥", "color": "#EE4C2C",
          "explanation": "PyTorch is a deep learning and AI framework popular for research and production neural networks.",
          "mainUse": "Deep learning, AI research and GPU-accelerated models.",
          "example": "Define a neural network, then train it on a dataset with autograd.",
          "url": "https://pytorch.org/" }
      ]
    },
    {
      "category": "Statistics",
      "items": [
        { "name": "SciPy", "icon": "🔬", "color": "#8CAAE6",
          "explanation": "SciPy provides scientific and mathematical functions for optimization, statistics, integration, interpolation and signal processing.",
          "mainUse": "Advanced maths, statistics and signal processing.",
          "example": "Run a statistical test or solve an optimisation problem.",
          "url": "https://scipy.org/" },
        { "name": "Statsmodels", "icon": "📉", "color": "#2E5E8C",
          "explanation": "Statsmodels is used for statistical modelling, hypothesis testing and econometric analysis, with detailed result summaries.",
          "mainUse": "Regression, time series and statistical tests.",
          "example": "Fit an ordinary least squares regression and read its summary table.",
          "url": "https://www.statsmodels.org/" }
      ]
    },
    {
      "category": "NLP",
      "items": [
        { "name": "NLTK", "icon": "💬", "color": "#2E7D32",
          "explanation": "NLTK is a Natural Language Processing toolkit for working with human language data such as tokenisation, tagging and classification.",
          "mainUse": "Text processing and natural language analysis.",
          "example": "Tokenise a sentence, remove stop words and tag parts of speech.",
          "url": "https://www.nltk.org/" }
      ]
    },
    {
      "category": "Web Scraping",
      "items": [
        { "name": "Beautiful Soup", "icon": "🍲", "color": "#6D4C41",
          "explanation": "Beautiful Soup is used for web scraping: it parses HTML and XML documents and makes it easy to pull out the data you need.",
          "mainUse": "Parsing HTML and extracting data from web pages.",
          "example": "Fetch a page and collect every link or table into a list.",
          "url": "https://www.crummy.com/software/BeautifulSoup/" },
        { "name": "Requests", "icon": "🌐", "color": "#2AA198",
          "explanation": "Requests is used to send HTTP requests and work with web APIs, downloading data directly into your program.",
          "mainUse": "Calling REST APIs and downloading web data.",
          "example": "GET the GitHub issues API and turn the JSON response into a table.",
          "url": "https://requests.readthedocs.io/" }
      ]
    },
    {
      "category": "Databases",
      "items": [
        { "name": "SQL", "icon": "🗄️", "color": "#00758F",
          "explanation": "SQL is used to store, retrieve, filter and analyse structured data from relational databases.",
          "mainUse": "Querying and managing relational data.",
          "example": "SELECT, filter and aggregate records from a table.",
          "url": "https://www.w3schools.com/sql/" },
        { "name": "SQLite", "icon": "🪶", "color": "#003B57",
          "explanation": "SQLite is a lightweight, file-based database system used for storing and querying structured data without a server.",
          "mainUse": "A file-based database with no server to install.",
          "example": "Create a Students table, insert rows and query them with pandas.",
          "url": "https://www.sqlite.org/" }
      ]
    },
    {
      "category": "Development Tools",
      "items": [
        { "name": "Python", "icon": "🐍", "color": "#3572A5",
          "explanation": "Python is the primary programming language used for data science because it is simple, powerful and has a large ecosystem of data science libraries.",
          "mainUse": "Writing data science programs, scripts and notebooks.",
          "example": "Load a dataset, clean it and fit a model in only a few lines of code.",
          "url": "https://www.python.org/" },
        { "name": "Jupyter Notebook", "icon": "📓", "color": "#F37626",
          "explanation": "Jupyter Notebook provides an interactive environment where Python code, output, graphs and explanations can be written together.",
          "mainUse": "Interactive, story-style coding and documentation.",
          "example": "Write code cells, run them one by one and keep the output beside the code.",
          "url": "https://jupyter.org/" },
        { "name": "Google Colab", "icon": "☁️", "color": "#F9AB00",
          "explanation": "Google Colab is a cloud-based Jupyter Notebook environment that allows users to run Python and data science programs without installing everything locally.",
          "mainUse": "Running notebooks in the browser with free compute.",
          "example": "Open a shared notebook and run a data analysis with no local setup.",
          "url": "https://colab.research.google.com/" }
      ]
    }
  ]
};
