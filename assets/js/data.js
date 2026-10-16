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

,
    {
      "id": 6,
      "name": "Time Series Analysis with Pandas",
      "previewVideo": null,
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "Creates a time series from datetime objects, generates a DatetimeIndex with date_range, localizes and converts timezones, performs period arithmetic and frequency conversion, converts Series and DataFrames to periods, and resamples, downsamples and upsamples time series.",
      "sections": [
        {
          "letter": "A",
          "title": "Create a time series from datetime objects",
          "video": null,
          "code": "import pandas as pd\n\n# Create datetime objects\ndates = pd.to_datetime([\n    '2026-01-01',\n    '2026-01-02',\n    '2026-01-03',\n    '2026-01-04',\n    '2026-01-05'\n])\n\n# Create data\ntemperature = [28, 30, 29, 31, 32]\n\n# Create time series with timestamps as index\ntime_series = pd.Series(\n    temperature,\n    index=dates\n)\n\n# Display the time series\nprint(\"Time Series:\")\nprint(time_series)"
        },
        {
          "letter": "B",
          "title": "Generate a DatetimeIndex with date_range",
          "video": null,
          "code": "import pandas as pd\n\n# Generate a DatetimeIndex with 7 dates\ndate_index = pd.date_range(\n    start='2026-01-01',\n    periods=7,\n    freq='D'\n)\n\n# Display the DatetimeIndex\nprint(\"Generated DatetimeIndex:\")\nprint(date_index)"
        },
        {
          "letter": "C",
          "title": "Timezone localization and conversion",
          "video": null,
          "code": "import pandas as pd\n\n--------------------------------------------------\n1. Generate date range by setting a time zone\n--------------------------------------------------\n\nindia_dates = pd.date_range(\n    start='2026-01-01 09:00',\n    periods=3,\n    freq='h',\n    tz='Asia/Kolkata'\n)\n\nprint(\"1. Date Range with Asia/Kolkata Time Zone:\")\nprint(india_dates)\n\n\n--------------------------------------------------\n2. Create a timezone-naive DatetimeIndex\n--------------------------------------------------\n\ndates = pd.date_range(\n    start='2026-01-01 09:00',\n    periods=3,\n    freq='h'\n)\n\nprint(\"\\n2. Timezone-naive Date Range:\")\nprint(dates)\n\n\n--------------------------------------------------\n3. Localize the timezone\n--------------------------------------------------\n\nlocalized_dates = dates.tz_localize('Asia/Kolkata')\n\nprint(\"\\n3. After Localizing to Asia/Kolkata:\")\nprint(localized_dates)\n\n\n--------------------------------------------------\n4. Convert to another timezone using tz_convert()\n--------------------------------------------------\n\nnew_york_dates = localized_dates.tz_convert(\n    'America/New_York'\n)\n\nprint(\"\\n4. Converted to America/New_York:\")\nprint(new_york_dates)\n\n\n-------------------------------------------------\n5. Create another time series in a different\n   timezone\n--------------------------------------------------\n\nindia_series = pd.Series(\n    [100, 200, 300],\n    index=localized_dates\n)\n\nnew_york_series = pd.Series(\n    [400, 500, 600],\n    index=new_york_dates\n)\n\nprint(\"\\n5. India Time Series:\")\nprint(india_series)\n\nprint(\"\\nNew York Time Series:\")\nprint(new_york_series)\n\n\n--------------------------------------------------\n6. Combine two different timezone series\n--------------------------------------------------\n\ncombined_series = pd.concat([\n    india_series,\n    new_york_series\n])\n\nprint(\"\\n6. Combined Time Series:\")\nprint(combined_series)\n\nSample Output\n1. Date Range with Time Zone\n1. Date Range with Asia/Kolkata Time Zone:\n\nDatetimeIndex(['2026-01-01 09:00:00+05:30',\n               '2026-01-01 10:00:00+05:30',\n               '2026-01-01 11:00:00+05:30'],\n              dtype='datetime64[ns, Asia/Kolkata]', freq='h')\n2. Timezone-Naive Date Range\n2. Timezone-naive Date Range:\n\nDatetimeIndex(['2026-01-01 09:00:00',\n               '2026-01-01 10:00:00',\n               '2026-01-01 11:00:00'],\n              dtype='datetime64[ns]', freq='h')\n3. Localized Time Zone\n3. After Localizing to Asia/Kolkata:\n\nDatetimeIndex(['2026-01-01 09:00:00+05:30',\n               '2026-01-01 10:00:00+05:30',\n               '2026-01-01 11:00:00+05:30'],\n              dtype='datetime64[ns, Asia/Kolkata]', freq='h')\n4. Converted to New York Time\n4. Converted to America/New_York:\n\nDatetimeIndex(['2025-12-31 22:30:00-05:00',\n               '2025-12-31 23:30:00-05:00',\n               '2026-01-01 00:30:00-05:00'],\n              dtype='datetime64[ns, America/New_York]', freq='h')\n5. Time Series\n5. India Time Series:\n\n2026-01-01 09:00:00+05:30    100\n2026-01-01 10:00:00+05:30    200\n2026-01-01 11:00:00+05:30    300\ndtype: int64\nNew York Time Series:\n\n2025-12-31 22:30:00-05:00    400\n2025-12-31 23:30:00-05:00    500\n2026-01-01 00:30:00-05:00    600\ndtype: int64\n6. Combined Time Series\n6. Combined Time Series:\n\n2025-12-31 22:30:00-05:00    400\n2025-12-31 23:30:00-05:00    500\n2026-01-01 00:30:00-05:00    600\n2026-01-01 09:00:00+05:30    100\n2026-01-01 10:00:00+05:30    200\n2026-01-01 11:00:00+05:30    300\ndtype: int64\n\n\n\n\tPerform period arithmetic such as adding and subtracting integers from periods and construct range of periods using period_range function."
        },
        {
          "letter": "D",
          "title": "Period arithmetic and period_range",
          "video": null,
          "code": "import pandas as pd\n\n# Create a monthly Period\np = pd.Period('2026-01', freq='M')\n\nprint(\"Original Period:\")\nprint(p)\n\n# Add integers to the period\nprint(\"\\nAfter adding 2:\")\nprint(p + 2)\n\nprint(\"\\nAfter adding 5:\")\nprint(p + 5)\n\n# Subtract integers from the period\nprint(\"\\nAfter subtracting 1:\")\nprint(p - 1)\n\nprint(\"\\nAfter subtracting 3:\")\nprint(p - 3)\n\n# Create a range of monthly periods\nperiods = pd.period_range(\n    start='2026-01',\n    periods=6,\n    freq='M'\n)\n\nprint(\"\\nRange of Periods:\")\nprint(periods)\nSample Output\nOriginal Period:\n2026-01\n\nAfter adding 2:\n2026-03\n\nAfter adding 5:\n2026-06\n\nAfter subtracting 1:\n2025-12\n\nAfter subtracting 3:\n2025-10\n\nRange of Periods:\nPeriodIndex(['2026-01', '2026-02', '2026-03',\n             '2026-04', '2026-05', '2026-06'],\n            dtype='period[M]')\n\n\t\nConvert Periods and Periodlndex objects to another frequency with asfreq method."
        },
        {
          "letter": "E",
          "title": "Convert period frequencies with asfreq",
          "video": null,
          "code": "import pandas as pd\n\n--------------------------------------------------\n1. Create a monthly Period\n---------------------------------------------------\n\np = pd.Period('2026-01', freq='M')\n\nprint(\"Original Period:\")\nprint(p)\n\n\n---------------------------------------------------\n2. Convert monthly Period to daily frequency\n---------------------------------------------------\n\ndaily_start = p.asfreq('D', how='start')\n\nprint(\"\\nMonthly Period converted to Daily (Start):\")\nprint(daily_start)\n\n\ndaily_end = p.asfreq('D', how='end')\n\nprint(\"\\nMonthly Period converted to Daily (End):\")\nprint(daily_end)\n\n\n---------------------------------------------------\n 3. Create a PeriodIndex\n ---------------------------------------------------\n\nperiod_index = pd.period_range(\n    start='2026-01',\n    periods=3,\n    freq='M'\n)\n\nprint(\"\\nOriginal PeriodIndex:\")\nprint(period_index)\n\n\n ---------------------------------------------------\n 4. Convert PeriodIndex to daily frequency\n ---------------------------------------------------\n\ndaily_period_index = period_index.asfreq(\n    'D',\n    how='start'\n)\n\nprint(\"\\nPeriodIndex converted to Daily Frequency:\")\nprint(daily_period_index)\n\n\n ---------------------------------------------------\n 5. Convert PeriodIndex to daily frequency at end\n ---------------------------------------------------\n\ndaily_period_index_end = period_index.asfreq(\n    'D',\n    how='end'\n)\n\nprint(\"\\nPeriodIndex converted to Daily Frequency (End):\")\nprint(daily_period_index_end)\n\nSample Output\nOriginal Period:\n2026-01\n\nMonthly Period converted to Daily (Start):\n2026-01-01\n\nMonthly Period converted to Daily (End):\n2026-01-31\n\nOriginal PeriodIndex:\nPeriodIndex(['2026-01', '2026-02', '2026-03'],\n            dtype='period[M]')\n\nPeriodIndex converted to Daily Frequency:\nPeriodIndex(['2026-01-01', '2026-02-01', '2026-03-01'],\n            dtype='period[D]')\n\nPeriodIndex converted to Daily Frequency (End):\nPeriodIndex(['2026-01-31', '2026-02-28', '2026-03-31'],\n            dtype='period[D]')\n\t\nConvert Series and DataFrame objects indexed by timestamps to periods with the to_period method."
        },
        {
          "letter": "F",
          "title": "Convert Series and DataFrame to periods",
          "video": null,
          "code": "import pandas as pd\n\n--------------------------------------------------\n 1. Create a Series with timestamp index\n--------------------------------------------------\n\ndates = pd.to_datetime([\n    '2026-01-10',\n    '2026-02-15',\n    '2026-03-20',\n    '2026-04-25'\n])\n\nsales = pd.Series(\n    [1000, 1500, 1800, 2200],\n    index=dates\n)\n\nprint(\"Original Series:\")\nprint(sales)\n\n\n--------------------------------------------------\n 2. Convert Series from timestamps to monthly periods\n-------------------------------------------------\n\nperiod_series = sales.to_period('M')\n\nprint(\"\\nSeries converted to Monthly Periods:\")\nprint(period_series)\n\n\n--------------------------------------------------\n3. Create a DataFrame with timestamp index\n--------------------------------------------------\n\ndf = pd.DataFrame(\n    {\n        'Sales': [1000, 1500, 1800, 2200],\n        'Profit': [200, 300, 400, 500]\n    },\n    index=dates\n)\n\nprint(\"\\nOriginal DataFrame:\")\nprint(df)\n\n\n --------------------------------------------------\n 4. Convert DataFrame to monthly periods\n --------------------------------------------------\n\nperiod_df = df.to_period('M')\n\nprint(\"\\nDataFrame converted to Monthly Periods:\")\nprint(period_df)\n\nSample Output\n1. Original Series\nOriginal Series:\n2026-01-10    1000\n2026-02-15    1500\n2026-03-20    1800\n2026-04-25    2200\ndtype: int64\n2. Series Converted to Monthly Periods\nSeries converted to Monthly Periods:\n2026-01    1000\n2026-02    1500\n2026-03    1800\n2026-04    2200\nFreq: M, dtype: int64\n3. Original DataFrame\nOriginal DataFrame:\n            Sales  Profit\n2026-01-10   1000     200\n2026-02-15   1500     300\n2026-03-20   1800     400\n2026-04-25   2200     500\n4. DataFrame Converted to Monthly Periods\nDataFrame converted to Monthly Periods:\n         Sales  Profit\n2026-01   1000     200\n2026-02   1500     300\n2026-03   1800     400\n2026-04   2200     500\n\nFreq: M\n\n\n\n\n\tPerform resampling, downsampling and upsampling for the time series."
        },
        {
          "letter": "G",
          "title": "Resampling, downsampling and upsampling",
          "video": null,
          "code": "import pandas as pd\n\n --------------------------------------------------\n 1. Create an hourly time series\n --------------------------------------------------\n\ndates = pd.date_range(\n    start='2026-01-01 00:00',\n    periods=12,\n    freq='h'\n)\n\nvalues = [10, 12, 15, 14, 18, 20,\n          22, 21, 25, 28, 30, 32]\n\ntime_series = pd.Series(\n    values,\n    index=dates\n)\n\nprint(\"Original Hourly Time Series:\")\nprint(time_series)\n\n\n --------------------------------------------------\n 2. Resampling - calculate 3-hourly mean\n --------------------------------------------------\n\nresampled = time_series.resample('3h').mean()\n\nprint(\"\\nResampled Time Series - 3 Hour Mean:\")\nprint(resampled)\n\n\n --------------------------------------------------\n 3. Downsampling - Hourly to 4-hourly\n --------------------------------------------------\n\ndownsampled = time_series.resample('4h').sum()\n\nprint(\"\\nDownsampled Time Series - 4 Hour Sum:\")\nprint(downsampled)\n\n\n --------------------------------------------------\n 4. Upsampling - Hourly to 30-minute intervals\n --------------------------------------------------\n\nupsampled = time_series.resample('30min').asfreq()\n\nprint(\"\\nUpsampled Time Series - 30 Minute:\")\nprint(upsampled)\n\n\n --------------------------------------------------\n 5. Upsampling with Forward Fill\n --------------------------------------------------\n\nupsampled_ffill = time_series.resample('30min').ffill()\n\nprint(\"\\nUpsampled Time Series using Forward Fill:\")\nprint(upsampled_ffill)\n\nSample Output\n1. Original Time Series\nOriginal Hourly Time Series:\n\n2026-01-01 00:00:00    10\n2026-01-01 01:00:00    12\n2026-01-01 02:00:00    15\n2026-01-01 03:00:00    14\n2026-01-01 04:00:00    18\n2026-01-01 05:00:00    20\n2026-01-01 06:00:00    22\n2026-01-01 07:00:00    21\n2026-01-01 08:00:00    25\n2026-01-01 09:00:00    28\n2026-01-01 10:00:00    30\n2026-01-01 11:00:00    32\nFreq: h, dtype: int64\n\n2. Resampling\nThe hourly data is resampled into 3-hour intervals and the mean is calculated.\nResampled Time Series - 3 Hour Mean:\n\n2026-01-01 00:00:00    12.333333\n2026-01-01 03:00:00    17.333333\n2026-01-01 06:00:00    22.666667\n2026-01-01 09:00:00    30.000000\nFreq: 3h, dtype: float64\nFor example:\n(10 + 12 + 15) / 3 = 12.33\n\n3. Downsampling\nHourly data is reduced to 4-hour intervals and the values are summed.\nDownsampled Time Series - 4 Hour Sum:\n\n2026-01-01 00:00:00    51\n2026-01-01 04:00:00    81\n2026-01-01 08:00:00    115\nFreq: 4h, dtype: int64\nFor example:\n10 + 12 + 15 + 14 = 51\n\n4. Upsampling\nHourly data is increased to 30-minute intervals.\nUpsampled Time Series - 30 Minute:\n\n2026-01-01 00:00:00    10.0\n2026-01-01 00:30:00     NaN\n2026-01-01 01:00:00    12.0\n2026-01-01 01:30:00     NaN\n2026-01-01 02:00:00    15.0\n2026-01-01 02:30:00     NaN\n2026-01-01 03:00:00    14.0\n...\nFreq: 30min, dtype: float64\nThe newly created 30-minute timestamps contain NaN because no original observation exists at those times.\n\n5. Upsampling Using Forward Fill\nThe missing values can be filled using ffill():\nUpsampled Time Series using Forward Fill:\n\n2026-01-01 00:00:00    10\n2026-01-01 00:30:00    10\n2026-01-01 01:00:00    12\n2026-01-01 01:30:00    12\n2026-01-01 02:00:00    15\n2026-01-01 02:30:00    15\n2026-01-01 03:00:00    14\n...\nFreq: 30min, dtype: int64\n\nMy Programs : \nTime Series Analysis\na. Create Time Series\n\nrng = pd.date_range('2023-01-01', periods=6, freq='D')\nts = pd.Series(np.random.randn(len(rng)), index=rng)\nprint(ts)\n\nb. Time Zone Conversion\n\nts_utc = ts.tz_localize('UTC')\nts_ind = ts_utc.tz_convert('Asia/Kolkata')\nprint(ts_ind)\n\nc. Period Arithmetic and Conversion\n\np = pd.Period('2024Q1')\nprint(p + 1)\nprint(p.asfreq('M', 'end'))\n\nd. Resampling\n\nts = pd.Series(np.random.randn(100),\n               index=pd.date_range('2024-01-01', periods=100))\nts_monthly = ts.resample('M').mean()\nprint(ts_monthly)"
        }
      ]
    },
    {
      "id": 7,
      "name": "Data Aggregation with groupby",
      "previewVideo": null,
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "Creates a tabular dataset as a DataFrame and splits it into groups using groupby with single and multiple keys, selects single and multiple columns, and computes summary statistics such as mean marks by department and by department and year.",
      "sections": [
        {
          "letter": "A",
          "title": "Group by single and multiple keys",
          "video": null,
          "code": "import pandas as pd\n\n# Create a tabular dataset\ndata = {\n    'Name': ['Ravi', 'Sita', 'Arun', 'Priya', 'Kiran', 'Anil', 'Lakshmi', 'Rahul'],\n    'Department': ['CSE', 'CSE', 'ECE', 'ECE', 'CSE', 'ECE', 'CSE', 'ECE'],\n    'Year': [2, 2, 3, 3, 2, 3, 3, 2],\n    'Marks': [85, 90, 78, 88, 75, 82, 95, 70]\n}\n\n# Create DataFrame\ndf = pd.DataFrame(data)\n\nprint(\"Original DataFrame:\")\nprint(df)\n\n*/ # 1. Group by a SINGLE KEY  */\n\nprint(\"\\n1. Group by Department:\")\n\ngroup1 = df.groupby('Department')\n\nfor name, group in group1:\n    print(\"\\nDepartment:\", name)\n    print(group)\n\n# Calculate average marks for each department\nprint(\"\\nAverage Marks by Department:\")\nprint(df.groupby('Department')['Marks'].mean())\n\n*/ # 2. Group by MULTIPLE KEYS */ \n\nprint(\"\\n2. Group by Department and Year:\")\n\ngroup2 = df.groupby(['Department', 'Year'])\n\nfor name, group in group2:\n    print(\"\\nGroup:\", name)\n    print(group)\n\n# Calculate average marks for each Department and Year\nprint(\"\\nAverage Marks by Department and Year:\")\nprint(df.groupby(['Department', 'Year'])['Marks'].mean())"
        }
      ]
    },
    {
      "id": 8,
      "name": "Web Scraping and Sentiment Analysis of Product Reviews",
      "previewVideo": null,
      "youtubeVideo": null,
      "youtubeLink": null,
      "githubLink": "https://github.com/jaisimha16",
      "summary": "Extracts product reviews with Beautiful Soup, performs exploratory text analysis and WordCloud generation, analyzes stopword, numeric, word, character and average word length distributions, calculates sentiment with NLTK and VADER, and visualizes sentiment intensity with a scatter plot.",
      "sections": [
        {
          "letter": "A",
          "title": "Web scraping product reviews with Beautiful Soup",
          "video": null,
          "code": "For a reproducible experiment, save an authorized review page as reviews.html and run the following code. The CSS selectors must match the structure of the saved page.\nfrom bs4 import BeautifulSoup\nimport pandas as pd\n\n# Read the permitted, locally saved HTML file\nwith open(\"reviews.html\", \"r\", encoding=\"utf-8\") as file:\n    html_content = file.read()\n\nsoup = BeautifulSoup(html_content, \"html.parser\")\n\n# Update these selectors to match the source HTML\nreview_blocks = soup.select(\".review\")\n\nrecords = []\n\nfor block in review_blocks:\n    review_element = block.select_one(\".review-text\")\n    rating_element = block.select_one(\".rating\")\n    title_element = block.select_one(\".review-title\")\n\n    review_text = (\n        review_element.get_text(\" \", strip=True)\n        if review_element else \"\"\n    )\n\n    rating_text = (\n        rating_element.get_text(\" \", strip=True)\n        if rating_element else \"\"\n    )\n\n    title = (\n        title_element.get_text(\" \", strip=True)\n        if title_element else \"\"\n    )\n\n    if review_text:\n        records.append({\n            \"title\": title,\n            \"review\": review_text,\n            \"rating\": rating_text\n        })\n\ndf = pd.DataFrame(records)\n\ndf.to_csv(\"product_reviews.csv\", index=False, encoding=\"utf-8-sig\")\n\nprint(df.head())\nprint(\"Total reviews extracted:\", len(df))\nprint(\"Saved to product_reviews.csv\")"
        },
        {
          "letter": "B",
          "title": "EDA and WordCloud generation",
          "video": null,
          "code": "Run this code after completing Experiment 1. It creates three WordClouds and saves the sentiment labels for reuse in later experiments.\nimport pandas as pd\nimport matplotlib.pyplot as plt\nfrom wordcloud import WordCloud\nfrom vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer\n# Load extracted reviews\ndf = pd.read_csv(\"product_reviews.csv\")\ndf[\"review\"] = df[\"review\"].fillna(\"\").astype(str)\n# Initialize sentiment analyzer\nanalyzer = SentimentIntensityAnalyzer()\ndef classify_sentiment(text):\n    score = analyzer.polarity_scores(text)[\"compound\"]\n    if score >= 0.05:\n        return \"Positive\"\n    elif score <= -0.05:\n        return \"Negative\"\n    return \"Neutral\"\ndf[\"sentiment\"] = df[\"review\"].apply(classify_sentiment)\ndef generate_wordcloud(text, title, filename):\n    if not text.strip():\n        print(f\"No text available for: {title}\")\n        return\n\n    cloud = WordCloud(\n        width=1200,\n        height=600,\n        background_color=\"white\",\n        max_words=150,\n        collocations=False\n    ).generate(text)\n    plt.figure(figsize=(12, 6))\n    plt.imshow(cloud, interpolation=\"bilinear\")\n    plt.axis(\"off\")\n    plt.title(title)\n    plt.tight_layout()\n    plt.savefig(filename, dpi=300, bbox_inches=\"tight\")\n    plt.show()\n# All reviews\nall_text = \" \".join(df[\"review\"])\ngenerate_wordcloud(\n    all_text, \"WordCloud - All Reviews\", \"wordcloud_all.png\"\n)\n# Positive reviews\npositive_text = \" \".join(\n    df.loc[df[\"sentiment\"] == \"Positive\", \"review\"]\n)\ngenerate_wordcloud(\n    positive_text, \"WordCloud - Positive Reviews\",\n    \"wordcloud_positive.png\"\n)\n# Negative reviews\nnegative_text = \" \".join(\n    df.loc[df[\"sentiment\"] == \"Negative\", \"review\"]\n)\ngenerate_wordcloud(\n    negative_text, \"WordCloud - Negative Reviews\",\n    \"wordcloud_negative.png\"\n)\ndf.to_csv(\"product_reviews_analyzed.csv\", index=False)\nprint(df[\"sentiment\"].value_counts())\nprint(\"WordCloud images saved successfully.\")"
        },
        {
          "letter": "C",
          "title": "Stopword, numeric and length distributions",
          "video": null,
          "code": "import re\nimport pandas as pd\nimport nltk\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nfrom nltk.corpus import stopwords\nfrom collections import Counter\n\nnltk.download(\"stopwords\", quiet=True)\n\ndf = pd.read_csv(\"product_reviews.csv\")\ndf[\"review\"] = df[\"review\"].fillna(\"\").astype(str)\n\nstop_words = set(stopwords.words(\"english\"))\n\ndef analyze_review(text):\n    tokens = re.findall(r\"\\b[\\w']+\\b\", text.lower())\n    words = re.findall(r\"\\b[A-Za-z]+\\b\", text)\n    numeric_tokens = re.findall(r\"\\b\\d+(?:\\.\\d+)?\\b\", text)\n\n    stopword_tokens = [\n        token for token in tokens if token in stop_words\n    ]\n\n    return pd.Series({\n        \"word_count\": len(tokens),\n        \"character_count\": len(text),\n        \"numeric_count\": len(numeric_tokens),\n        \"stopword_count\": len(stopword_tokens),\n        \"average_word_length\": (\n            sum(len(word) for word in words) / len(words)\n            if words else 0\n        )\n    })\n\nstatistics = df[\"review\"].apply(analyze_review)\ndf = pd.concat([df, statistics], axis=1)\n\n# Save calculated statistics\ndf.to_csv(\"review_statistics.csv\", index=False)\n\n# Plot distributions\ncolumns = [\n    (\"stopword_count\", \"Stopword Count\"),\n    (\"numeric_count\", \"Numeric Token Count\"),\n    (\"word_count\", \"Word Count\"),\n    (\"character_count\", \"Character Count\"),\n    (\"average_word_length\", \"Average Word Length\")\n]\n\nfig, axes = plt.subplots(3, 2, figsize=(14, 15))\naxes = axes.flatten()\n\nfor i, (column, title) in enumerate(columns):\n    sns.histplot(\n        data=df, x=column, kde=True,\n        ax=axes[i], bins=20\n    )\n    axes[i].set_title(title)\n    axes[i].set_xlabel(title)\n    axes[i].set_ylabel(\"Number of Reviews\")\naxes[-1].axis(\"off\")\nplt.tight_layout()\nplt.savefig(\"review_statistics_distributions.png\", dpi=300)\nplt.show()\n# Most common stopwords\nall_tokens = re.findall(\n    r\"\\b[\\w']+\\b\",\n    \" \".join(df[\"review\"]).lower()\n)\nstopword_frequency = Counter(\n    token for token in all_tokens if token in stop_words\n)\nprint(\"Top 10 stopwords:\")\nprint(stopword_frequency.most_common(10))\n\nprint(\"\\nDescriptive statistics:\")\nprint(df[[\n    \"stopword_count\",\n    \"numeric_count\",\n    \"word_count\",\n    \"character_count\",\n    \"average_word_length\"\n]].describe())"
        },
        {
          "letter": "D",
          "title": "Sentiment analysis with NLTK and VADER",
          "video": null,
          "code": "import pandas as pd\nimport nltk\nfrom nltk.sentiment.vader import SentimentIntensityAnalyzer as NLTKVADER\nfrom vaderSentiment.vaderSentiment import (\n    SentimentIntensityAnalyzer as StandaloneVADER\n)\n\n# Download VADER lexicon for NLTK\nnltk.download(\"vader_lexicon\", quiet=True)\n\ndf = pd.read_csv(\"product_reviews.csv\")\ndf[\"review\"] = df[\"review\"].fillna(\"\").astype(str)\n\n# Initialize both implementations\nnltk_analyzer = NLTKVADER()\nvader_analyzer = StandaloneVADER()\n\ndef classify(score):\n    if score >= 0.05:\n        return \"Positive\"\n    elif score <= -0.05:\n        return \"Negative\"\n    return \"Neutral\"\n\n# NLTK VADER scores\nnltk_scores = df[\"review\"].apply(\n    nltk_analyzer.polarity_scores\n)\n\ndf[\"nltk_positive\"] = nltk_scores.apply(lambda x: x[\"pos\"])\ndf[\"nltk_negative\"] = nltk_scores.apply(lambda x: x[\"neg\"])\ndf[\"nltk_neutral\"] = nltk_scores.apply(lambda x: x[\"neu\"])\ndf[\"nltk_compound\"] = nltk_scores.apply(lambda x: x[\"compound\"])\n\n# Standalone VADER scores\nvader_scores = df[\"review\"].apply(\n    vader_analyzer.polarity_scores\n)\n\ndf[\"vader_positive\"] = vader_scores.apply(lambda x: x[\"pos\"])\ndf[\"vader_negative\"] = vader_scores.apply(lambda x: x[\"neg\"])\ndf[\"vader_neutral\"] = vader_scores.apply(lambda x: x[\"neu\"])\ndf[\"vader_compound\"] = vader_scores.apply(lambda x: x[\"compound\"])\n\ndf[\"nltk_sentiment\"] = df[\"nltk_compound\"].apply(classify)\ndf[\"vader_sentiment\"] = df[\"vader_compound\"].apply(classify)\n\n# Display sample results\nprint(df[[\n    \"review\",\n    \"nltk_compound\",\n    \"nltk_sentiment\",\n    \"vader_compound\",\n    \"vader_sentiment\"\n]].head(10).to_string(index=False))\n\n# Count sentiment categories\nprint(\"\\nNLTK sentiment distribution:\")\nprint(df[\"nltk_sentiment\"].value_counts())\n\nprint(\"\\nStandalone VADER sentiment distribution:\")\nprint(df[\"vader_sentiment\"].value_counts())\n\n# Save output\ndf.to_csv(\"sentiment_analysis_results.csv\", index=False)\nprint(\"\\nResults saved to sentiment_analysis_results.csv\")"
        },
        {
          "letter": "E",
          "title": "Scatter intensity plot of sentiments",
          "video": null,
          "code": "The following code uses the results produced in Experiment 4.\nimport pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Load sentiment analysis results\ndf = pd.read_csv(\"sentiment_analysis_results.csv\")\n\n# Ensure valid compound scores\ndf[\"vader_compound\"] = pd.to_numeric(\n    df[\"vader_compound\"], errors=\"coerce\"\n)\n\ndf = df.dropna(subset=[\"vader_compound\"]).reset_index(drop=True)\n\n# Assign review indices\ndf[\"review_index\"] = range(1, len(df) + 1)\n\n# Set consistent sentiment colors\npalette = {\n    \"Positive\": \"green\",\n    \"Negative\": \"red\",\n    \"Neutral\": \"gray\"\n}\n\nplt.figure(figsize=(14, 7))\n\nsns.scatterplot(\n    data=df,\n    x=\"review_index\",\n    y=\"vader_compound\",\n    hue=\"vader_sentiment\",\n    palette=palette,\n    s=70,\n    alpha=0.8\n)\n\n# Sentiment classification thresholds\nplt.axhline(\n    y=0.05, color=\"green\", linestyle=\"--\",\n    label=\"Positive threshold\"\n)\nplt.axhline(\n    y=-0.05, color=\"red\", linestyle=\"--\",\n    label=\"Negative threshold\"\n)\nplt.axhline(\n    y=0, color=\"black\", linestyle=\":\",\n    label=\"Neutral reference\"\n)\n\nplt.ylim(-1.05, 1.05)\nplt.xlabel(\"Review Index\")\nplt.ylabel(\"VADER Compound Sentiment Score\")\nplt.title(\"Sentiment Intensity of Product Reviews\")\nplt.legend(loc=\"best\")\nplt.grid(alpha=0.25)\nplt.tight_layout()\n\nplt.savefig(\"sentiment_intensity_scatter.png\", dpi=300)\nplt.show()\n\nprint(\"Scatter intensity plot saved successfully.\")"
        }
      ]
    }  ],

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
    },
    "6": {
      "aim": "To perform time series analysis in Pandas using datetime objects, date ranges, timezones, periods, period conversion, and resampling, downsampling and upsampling.",
      "description": "Creates and manipulates time series data indexed by timestamps, generates date ranges, localizes and converts timezones, performs period arithmetic and frequency conversion, converts timestamp-indexed Series and DataFrames to periods, and resamples time series.",
      "tools": [
        "Python",
        "Pandas"
      ],
      "procedure": [
        "Create a time series from datetime objects.",
        "Generate a DatetimeIndex with date_range.",
        "Localize and convert timezones.",
        "Perform period arithmetic.",
        "Convert period frequencies.",
        "Convert Series and DataFrame to periods.",
        "Resample, downsample and upsample."
      ],
      "expectedOutput": [
        "Time Series printed with timestamp index.",
        "DatetimeIndex generated.",
        "Timezone converted timestamps.",
        "Period arithmetic output.",
        "Converted periods.",
        "Resampling output."
      ],
      "result": "Time series were created and manipulated successfully with Pandas."
    },
    "7": {
      "aim": "To aggregate tabular data using groupby with single and multiple keys and compute summary statistics.",
      "description": "Creates a DataFrame and groups data by department and by department and year, then computes mean marks for each group.",
      "tools": [
        "Python",
        "Pandas"
      ],
      "procedure": [
        "Create a tabular DataFrame.",
        "Group by a single key.",
        "Group by multiple keys.",
        "Compute average marks."
      ],
      "expectedOutput": [
        "Grouped DataFrames printed.",
        "Average marks by department and year."
      ],
      "result": "Data aggregation using groupby was demonstrated successfully."
    },
    "8": {
      "aim": "To scrape product reviews with Beautiful Soup and analyze them with EDA, WordClouds, text statistics and VADER sentiment analysis.",
      "description": "Extracts reviews from an authorized HTML source, performs exploratory text analysis, generates WordClouds, analyzes stopword, numeric and length distributions, calculates sentiment with NLTK and VADER, and plots sentiment intensity.",
      "tools": [
        "Python",
        "Pandas",
        "Beautiful Soup",
        "NLTK",
        "VADER",
        "Matplotlib",
        "Seaborn",
        "WordCloud"
      ],
      "procedure": [
        "Scrape reviews to CSV.",
        "Generate WordClouds.",
        "Calculate text statistics and distributions.",
        "Classify sentiment.",
        "Plot sentiment intensity."
      ],
      "expectedOutput": [
        "product_reviews.csv saved.",
        "WordCloud images saved.",
        "Sentiment results saved.",
        "Scatter plot saved."
      ],
      "result": "Product reviews were scraped, analyzed and visualized successfully."
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
