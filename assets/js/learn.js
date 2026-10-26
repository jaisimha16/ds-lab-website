/* =====================================================================
   learn.js — teaching content for the experiment pages.

   Everything here is derived from the real experiment code in
   assets/js/data.js. Nothing is invented: if a fact is not in the
   project it is marked as "not available in this project".

   window.LAB_LEARN = {
     "<experiment id>": {
        objectives: [...],
        theory: "...",
        algorithm: [...],
        flowchart: "ASCII logic diagram",
        notes:   [{ section: "A", text: "what this code does" }],
        sampleInput: "text shown in the stdin box (or '' when not needed)",
        needsInput: true|false,
        troubleshooting: [{ problem: "...", fix: "..." }],
        viva: [{ q: "...", a: "..." }],
        related: [ids],
        tutorial: { searchQuery: "...", note: "..." },
        fixedCode: { "6-C": "corrected, runnable source" }
     }
   }
   ===================================================================== */
var LAB_LEARN = {

  "1": {
    objectives: [
      "Read an existing CSV file into pandas and inspect its shape and columns.",
      "Build a DataFrame from a Python dictionary of lists.",
      "Write a DataFrame to CSV, JSON and Excel files.",
      "Read every exported file back so the output is verified rather than assumed.",
      "Understand why the row index appears in an exported CSV and how to remove it."
    ],
    theory: "A DataFrame is a table with rows and columns, like a spreadsheet in Python. " +
      "pandas gives one set of functions for every tabular format: read_csv reads comma separated text, " +
      "read_json reads JSON records and read_excel reads a workbook sheet. " +
      "The same table can be written back with to_csv, to_json and to_excel. " +
      "Because every section reads the file it just created, a mistake in the export step is visible immediately " +
      "instead of being assumed away.",
    algorithm: [
      "Import pandas (and openpyxl for Excel).",
      "Read car_dataset_40x20.csv and inspect head(), shape and columns.",
      "Create a dictionary of equal-length lists and convert it with pd.DataFrame().",
      "Export to CSV with df.to_csv('Student_output.txt'), then read it back.",
      "Export to JSON with orient='records' and indent=4, then read it back.",
      "Export to Excel with sheet_name='Student details' and index=False, then read it back."
    ],
    flowchart: [
      "  ┌─────────────────────────┐",
      "  │ Import pandas, openpyxl │",
      "  └────────────┬────────────┘",
      "               ▼",
      "  ┌─────────────────────────┐   ┌────────────────────────────┐",
      "  │ A: read_csv + inspect  │   │ B: build DataFrame (dict)  │",
      "  │    head/shape/columns  │   │    to_csv -> read back      │",
      "  └────────────┬────────────┘   └──────────────┬─────────────┘",
      "               ▼                              ▼",
      "  ┌─────────────────────────┐   ┌────────────────────────────┐",
      "  │ C: to_json -> read back │   │ D: to_excel -> read back   │",
      "  └─────────────────────────┘   └────────────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "pd.read_csv() returns a DataFrame; head() shows the first rows, shape gives (rows, columns) and columns lists the column names." },
      { section: "B", text: "pd.DataFrame(Student_data) builds the table from three equal-length lists. to_csv() writes it; the printed extra column is the row index." },
      { section: "C", text: "orient='records' writes one JSON object per row (easy to read back), indent=4 just makes the file human readable." },
      { section: "D", text: "to_excel() needs openpyxl. index=False stops the row index from becoming an Excel column, and sheet_name names the worksheet." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "FileNotFoundError: car_dataset_40x20.csv", fix: "The dataset is copied into the sandbox automatically. Run it from the Code & Run tab, or place the file next to your script when running locally." },
      { problem: "ModuleNotFoundError: No module named 'openpyxl'", fix: "The Excel section needs openpyxl. It is installed automatically in the browser sandbox; install it with pip install openpyxl locally." },
      { problem: "The exported CSV has an extra unnamed first column", fix: "That column is the row index. Use df.to_csv('file.csv', index=False) to remove it." },
      { problem: "The DataFrame prints as a single line in the console", fix: "In Jupyter the last expression is rendered as a table. In the browser console use print(df) or print(df.to_string())." }
    ],
    viva: [
      { q: "Which pandas function reads a CSV file?", a: "pd.read_csv('file.csv')." },
      { q: "How do you avoid the row index in an exported CSV?", a: "Pass index=False to to_csv() (or to_excel())." },
      { q: "Which file is produced by to_json with orient='records'?", a: "A JSON array where each element is one row of the DataFrame." },
      { q: "Why does the experiment read every file back?", a: "To verify that the export really produced the expected data instead of assuming it did." },
      { q: "What library does pandas need for Excel support?", a: "openpyxl (installed here automatically through micropip)." }
    ],
    related: [2, 3],
    tutorial: {
      searchQuery: "pandas read_csv to_csv to_json to_excel tutorial for beginners",
      note: "A recorded walkthrough of this experiment is included above; the search link opens YouTube results for a matching pandas file-handling tutorial."
    }
  },

  "2": {
    objectives: [
      "Call a public REST endpoint with requests and turn the JSON answer into a DataFrame.",
      "Create a SQLite table from Python and commit the transaction.",
      "Read a SQL table back with pandas.read_sql_query.",
      "Update and delete rows and confirm the change on disk."
    ],
    theory: "A REST API is a URL that answers with structured data, usually JSON. requests.get(url) performs the call " +
      "and .json() turns the answer into Python dictionaries. SQLite is a file-based relational database that needs no server: " +
      "a connection is opened, SQL statements are executed through a cursor, and conn.commit() writes the changes to the file. " +
      "Without commit() the work is thrown away when the connection closes.",
    algorithm: [
      "Send a GET request to the pandas GitHub issues endpoint.",
      "Convert the JSON list of issues into a DataFrame and print id, title and state.",
      "Connect to Students.db and create the Students table if it does not exist.",
      "Insert rows and commit after each insert.",
      "Query the table with pandas.read_sql_query and print the result.",
      "Delete one row, update another, commit, then close the connection."
    ],
    flowchart: [
      "  ┌──────────────────────┐",
      "  │ requests.get(url)    │",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐",
      "  │ .json() -> DataFrame │",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐   ┌────────────────────┐",
      "  │ sqlite3.connect()    │──▶│ CREATE TABLE IF NOT│",
      "  └──────────┬───────────┘   └─────────┬──────────┘",
      "             ▼                        ▼",
      "  ┌──────────────────────┐   ┌────────────────────┐",
      "  │ INSERT + commit()    │──▶│ SELECT via pandas   │",
      "  └──────────┬───────────┘   └─────────┬──────────┘",
      "             ▼                        ▼",
      "  ┌───────────────────────────────────────────┐",
      "  │ UPDATE / DELETE  ->  commit()  ->  close  │",
      "  └───────────────────────────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "requests.get(url) returns a response; .json() decodes it. The GitHub API answers with a list of issue dictionaries, which pd.DataFrame() turns into a table." },
      { section: "B", text: "CREATE TABLE IF NOT EXISTS makes the script safe to run twice. commit() is what actually writes to Students.db on disk." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "requests.exceptions.ConnectionError in the browser sandbox", fix: "Outbound HTTPS is routed through pyodide-http. If the network is blocked, save the JSON response to a file first and read it with pd.read_json('issues.json')." },
      { problem: "sqlite3.OperationalError: no such table: Students", fix: "The CREATE TABLE statement did not run or was not committed. Run it once before the SELECT." },
      { problem: "The UPDATE seems to do nothing", fix: "Add conn.commit() after the UPDATE, and make sure you read the row back after committing, not before." },
      { problem: "pd.read_sql_query fails with a pandas error", fix: "Pass the connection explicitly: pd.read_sql_query('SELECT * FROM Students', conn)." }
    ],
    viva: [
      { q: "What does requests.get(url).json() return?", a: "The decoded JSON body, usually a Python list of dictionaries." },
      { q: "Why is conn.commit() necessary?", a: "SQLite keeps changes in a transaction; commit writes them to the database file permanently." },
      { q: "Which SQL keyword creates a table only when it is missing?", a: "CREATE TABLE IF NOT EXISTS." },
      { q: "How do you read a SQL table with pandas?", a: "pd.read_sql_query('SELECT * FROM Students', conn)." }
    ],
    related: [1, 7],
    tutorial: {
      searchQuery: "python requests api pandas sqlite3 tutorial beginners",
      note: "A recorded walkthrough of this experiment is included above; the search link opens YouTube results for a matching REST API and SQLite tutorial."
    }
  },

  "3": {
    objectives: [
      "Detect missing values with isna() and remove or fill them.",
      "Encode a categorical text column into numbers with map().",
      "Flag outliers that lie outside a +/-3 threshold.",
      "Split a raw string with re.split() and a regular expression."
    ],
    theory: "Real datasets are rarely complete. pandas marks missing values with NaN, and isna() returns a True/False mask " +
      "that shows exactly where the holes are. dropna() removes those rows and fillna() replaces them with a value you choose. " +
      "A text column such as gender is categorical, and map() converts it into numbers that a model can use. " +
      "Outliers are extreme values; a simple, teachable rule is to flag anything beyond three times the standard deviation. " +
      "A regular expression is a small pattern language: re.split(r'\\st', txt) cuts the string on a tab character.",
    algorithm: [
      "Create a DataFrame that deliberately contains NaN values.",
      "Print df.isna() to see the mask, then df.dropna() and df.fillna(0).",
      "Map the text column to numbers with .map({'male':1,'female':0}) and rename the column.",
      "Generate 100 random rows with numpy and count values outside +/-3.",
      "Split a raw string on whitespace with re.split(r'\\st', txt)."
    ],
    flowchart: [
      "  ┌──────────────────────┐",
      "  │ Load DataFrame       │",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐",
      "  │ df.isna() -> mask    │",
      "  └───────┬───────┬──────┘",
      "          │       │",
      "          ▼       ▼",
      "  ┌────────────┐  ┌────────────┐",
      "  │ dropna()   │  │ fillna(0)  │",
      "  └────────────┘  └────────────┘",
      "          │",
      "          ▼",
      "  ┌──────────────────────────────┐",
      "  │ map() encoding | outliers    │",
      "  │ (value>3)|(value<-3)        │",
      "  └───────────────┬──────────────┘",
      "                  ▼",
      "  ┌──────────────────────────────┐",
      "  │ re.split(r'\\st', text)       │",
      "  └──────────────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "isna() marks NaN and None; dropna() drops the rows that contain them, fillna(0) replaces them with 0." },
      { section: "B", text: "map() takes a dictionary and replaces each text value with its number. rename() changes only the column label." },
      { section: "C", text: "(data>3)|(data<-3) is an element-wise OR of two comparisons, so a cell is True when it is either too large or too small." },
      { section: "D", text: "r'\\st' is a raw pattern that matches a tab character; re.split() returns the parts between the tabs." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "KeyError when mapping a column", fix: "The dictionary key does not match the text exactly. Check df['gender'].unique() first - 'Male' and 'male' are different keys." },
      { problem: "fillna(0) still shows NaN", fix: "fillna() returns a new frame. Assign it: df = df.fillna(0)." },
      { problem: "No outliers are found", fix: "np.random.randn produces standard normal data, so almost nothing is beyond 3 sigma. Use a wider threshold or a skewed distribution to see outliers." },
      { problem: "re.split returns one element", fix: "The pattern did not match. Use repr(text) to see the real whitespace characters before writing the pattern." }
    ],
    viva: [
      { q: "What does df.isna() return?", a: "A Boolean DataFrame that is True where a value is missing." },
      { q: "Difference between dropna() and fillna(0)?", a: "dropna() removes the rows, fillna(0) keeps them and replaces the missing value with 0." },
      { q: "How is a text column converted to numbers?", a: "df['col'] = df['col'].map({'male':1,'female':0})." },
      { q: "How are outliers detected here?", a: "By flagging values greater than 3 or less than -3 with (data>3)|(data<-3)." },
      { q: "What does re.split(r'\\st', txt) do?", a: "Splits the string wherever a tab character appears and returns a list." }
    ],
    related: [1, 5],
    tutorial: {
      searchQuery: "pandas missing values dropna fillna map encoding outliers regex tutorial",
      note: "A recorded walkthrough of this experiment is included above; the search link opens YouTube results for a matching pandas data-cleaning tutorial."
    }
  },

  "4": {
    objectives: [
      "Build a MultiIndex from label arrays and select whole groups and single cells.",
      "Reshape a two-level DataFrame with unstack() and fold it back with stack().",
      "Join two DataFrames with different keys using an outer merge.",
      "Fill the gaps left by the merge with combine_first()."
    ],
    theory: "A MultiIndex is a hierarchical row label: instead of one label per row you have a tuple such as " +
      "('Engineering', 'CSE'). That structure lets you select an entire department and then a single branch inside it. " +
      "unstack() rotates the row index into columns (pivoting one level outward) and stack() folds it back. " +
      "merge() joins two tables on a key; with how='outer' the result keeps every row from both sides and fills the " +
      "non-matching cells with NaN. combine_first() then fills those NaN cells from the other frame where possible.",
    algorithm: [
      "Build label arrays for department and branch and create pd.MultiIndex.from_arrays().",
      "Select a whole department with marks.loc['Engineering'] and one cell with marks.loc[('Engineering','CSE')].",
      "Create a two-level DataFrame and call data.unstack() to pivot it.",
      "Fold the result back with unstacked_data.stack().",
      "Merge two frames with pd.merge(..., how='outer') on a shared key.",
      "Fill the gaps with df1.combine_first(df2)."
    ],
    flowchart: [
      "  ┌──────────────────────────┐",
      "  │ MultiIndex.from_arrays()  │",
      "  └────────────┬─────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐",
      "  │ loc['Dept'] / loc[('D','B')]│",
      "  └──────────────────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐   ┌──────────────────────────┐",
      "  │ unstack()  -> wide table │──▶│ stack()   -> tall table  │",
      "  └──────────────────────────┘   └──────────────────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐",
      "  │ merge(how='outer')        │",
      "  │   -> combine_first()      │",
      "  └──────────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "from_arrays() builds the hierarchy; .loc with a string selects a whole group, .loc with a tuple selects a single cell." },
      { section: "B", text: "unstack() moves the innermost index level into the columns; stack() is its inverse, so the two are often used together." },
      { section: "C", text: "how='outer' keeps unmatched rows from both frames; combine_first() prefers the left value and only falls back to the right where the left is NaN." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "KeyError: 'Engineering'", fix: "A MultiIndex level needs a tuple to select one cell: marks.loc[('Engineering','CSE')]. A plain string only selects the first level." },
      { problem: "unstack() raises 'Index contains duplicate entries'", fix: "Two rows share the same index tuple, so the pivot is ambiguous. Make the index unique first." },
      { problem: "The merged frame has NaN everywhere in one column", fix: "The key values do not match exactly (different spelling, spaces or types). Check df['key'].unique() in both frames." },
      { problem: "combine_first() returns the left frame unchanged", fix: "That is correct behaviour: left values win. Use df2.combine_first(df1) to flip the priority." }
    ],
    viva: [
      { q: "What is a MultiIndex?", a: "A hierarchical row label made of tuples, e.g. ('Engineering','CSE')." },
      { q: "How do you pick one cell from a MultiIndex?", a: "With a tuple: series.loc[('Engineering','CSE')]." },
      { q: "What does unstack() do?", a: "It pivots the innermost index level into columns; stack() folds it back." },
      { q: "What does how='outer' do in merge()?", a: "It keeps every row from both frames, leaving NaN where a key exists on only one side." },
      { q: "How do you fill those NaN cells from the other frame?", a: "df1.combine_first(df2) - the left value wins where it exists." }
    ],
    related: [1, 7],
    tutorial: {
      searchQuery: "pandas multiindex unstack stack merge combine_first tutorial",
      note: "A recorded walkthrough of this experiment is included above; the search link opens YouTube results for a matching pandas reshaping tutorial."
    }
  },

  "5": {
    objectives: [
      "Load a dataset with seaborn and inspect it with pandas.",
      "Draw line, bar, stacked-bar, histogram, scatter and box plots.",
      "Add titles, axis labels, annotations and a second set of axes.",
      "Save a figure as a PNG file and show it in the output console."
    ],
    theory: "Visualisation is how a table becomes an argument. Matplotlib is the drawing engine: you create a figure, " +
      "add axes and draw on them. A line plot shows change over an ordered variable, a bar chart compares categories, " +
      "a histogram shows the distribution of one numeric column, a scatter plot shows the relationship between two " +
      "numeric columns, and a box plot summarises a distribution with the median, quartiles and outliers. " +
      "Seaborn sits on top of Matplotlib and gives shorter calls for the same plots plus nicer defaults. " +
      "Anything you draw can be written to disk with savefig().",
    algorithm: [
      "Load the dataset (seaborn.load_dataset('iris') in the browser sandbox).",
      "Print head(), describe() and the correlation of the numeric columns.",
      "Draw a line plot of sepal length against petal length.",
      "Add a twin y-axis with ax.twinx() and annotate a point.",
      "Save the figure with plt.savefig('figure.png').",
      "Build the bar, stacked-bar, histogram, scatter and box plots and display them."
    ],
    flowchart: [
      "  ┌──────────────────────┐",
      "  │ Load dataset         │",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐",
      "  │ fig, ax = plt.subplots│",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐   ┌──────────────────────┐",
      "  │ ax.plot / ax.bar     │   │ ax.scatter / boxplot │",
      "  └──────────┬───────────┘   └──────────┬───────────┘",
      "             ▼                          ▼",
      "  ┌────────────────────────┐   ┌──────────────────────┐",
      "  │ titles, labels, legend │──▶│ savefig('x.png')     │",
      "  │ ax.twinx() annotate   │   │ plt.show()           │",
      "  └────────────────────────┘   └──────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "sns.load_dataset('iris') returns a DataFrame; the shim in this sandbox loads a bundled copy instead of downloading it." },
      { section: "B", text: "fig, ax = plt.subplots() gives one axes; ax.twinx() adds a second y-axis that shares the x-axis, and annotate() marks a point." },
      { section: "C", text: "df.plot.bar(x='species', y='sepal_length') draws straight from the DataFrame; ax.set_xticklabels(rotation=0) keeps the labels readable." },
      { section: "D", text: "stacked bars need a DataFrame whose columns already hold the groups; df.plot.bar(stacked=True) then stacks them." },
      { section: "E", text: "sns.histplot(..., kde=True) overlays the smoothed density curve on the histogram." },
      { section: "F", text: "sns.scatterplot with hue colours the points by class; df[cols].corr() gives the Pearson correlation matrix." },
      { section: "G", text: "sns.boxplot(x='department', y='marks', data=df) compares the spread of marks between departments." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "ModuleNotFoundError: No module named 'seaborn'", fix: "seaborn is not packaged for Pyodide. The sandbox provides a matplotlib-backed shim with the most used functions; for the full library install seaborn locally." },
      { problem: "No figure appears in the output", fix: "savefig() writes the PNG and the sandbox captures it as an image in the console panel; plt.show() is a no-op in the browser." },
      { problem: "X tick labels overlap", fix: "Rotate them: ax.set_xticklabels(ax.get_xticklabels(), rotation=0) or increase the figure width." },
      { problem: "Seaborn dataset download fails", fix: "Outbound HTTPS may be blocked. The bundled copy is used instead, so the plots still run." }
    ],
    viva: [
      { q: "Which library is the drawing engine and which is the shortcut layer?", a: "Matplotlib is the engine, Seaborn is the shortcut layer on top of it." },
      { q: "What does fig, ax = plt.subplots() return?", a: "A figure object and one axes object to draw on." },
      { q: "How do you add a second y-axis?", a: "ax.twinx() returns a second axes that shares the x-axis." },
      { q: "Which plot shows a distribution with a median and quartiles?", a: "The box plot." },
      { q: "How is a figure saved?", a: "plt.savefig('name.png', dpi=300, bbox_inches='tight')." }
    ],
    related: [3, 6],
    tutorial: {
      searchQuery: "matplotlib seaborn beginner tutorial line bar histogram scatter boxplot",
      note: "A recorded walkthrough of this experiment is included above; the search link opens YouTube results for a matching visualisation tutorial."
    }
  },

  "6": {
    objectives: [
      "Build a time series by using datetimes as the index.",
      "Generate a date range with pd.date_range().",
      "Localise a naive index to a timezone and convert it to another one.",
      "Do arithmetic on Period objects and convert their frequency with asfreq().",
      "Resample, downsample and upsample a time series."
    ],
    theory: "A time series is a sequence where the order carries meaning, so the index must be timestamps. " +
      "pandas stores them as datetime64 and supports three levels of precision: timestamps (a moment), " +
      "periods (a fixed span such as a month) and intervals (a duration). " +
      "date_range() generates a regular index, tz_localize() attaches a timezone to a naive index and " +
      "tz_convert() re-expresses the same moments in another timezone. " +
      "resample() changes the frequency of the observations: downsampling (hourly to 4-hourly) reduces the number of rows, " +
      "upsampling (hourly to 30-minute) increases it and creates NaN where no observation exists.",
    algorithm: [
      "Convert a list of date strings with pd.to_datetime() and use it as a Series index.",
      "Generate a regular index with pd.date_range(start, periods, freq).",
      "Create a naive index, localise it to Asia/Kolkata and convert it to America/New_York.",
      "Create a monthly Period, add and subtract integers, and build a range with pd.period_range().",
      "Convert a period to daily frequency with asfreq('D', how='start'|'end').",
      "Convert a timestamp-indexed Series or DataFrame with .to_period('M').",
      "Resample with mean() to downsample, with sum() to total, and with asfreq()/ffill() to upsample."
    ],
    flowchart: [
      "  ┌──────────────────────────┐",
      "  │ to_datetime / date_range │",
      "  └────────────┬─────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐",
      "  │ tz_localize()            │",
      "  │   -> tz_convert()        │",
      "  └────────────┬─────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐",
      "  │ Period + n / - n         │",
      "  │ asfreq('D','start'|'end')│",
      "  └────────────┬─────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐",
      "  │ resample('3h').mean()   │  downsample",
      "  │ resample('30min').asfreq│  upsample (+NaN)",
      "  │ .ffill() to fill gaps   │",
      "  └──────────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "The values become a Series whose index holds the datetimes; that index is what makes it a time series." },
      { section: "B", text: "date_range(start, periods, freq) creates a DatetimeIndex; freq='D' is daily, 'h' hourly, 'M' monthly." },
      { section: "C", text: "A naive index has no timezone. tz_localize attaches Asia/Kolkata; tz_convert shows the same instants in New York time (22:30 the previous day)." },
      { section: "D", text: "A Period represents a span, so p + 2 means 'two months later'. period_range() builds a PeriodIndex." },
      { section: "E", text: "asfreq('D', how='start') maps the month to its first day, how='end' to its last day." },
      { section: "F", text: "to_period('M') groups every timestamp into the month that contains it." },
      { section: "G", text: "Resampling groups the observations into new time bins. Upsampling creates empty bins, which ffill() fills with the previous value." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "TypeError: Cannot compare tz-naive and tz-aware timestamps", fix: "One index has a timezone and the other does not. Use tz_localize() on the naive one before comparing." },
      { problem: "FutureWarning: 'h' is deprecated, use 'h' instead", fix: "The frequency alias changed in pandas 2.2; 'H' became 'h'. Either spelling still works, but the new one avoids the warning." },
      { problem: "Resampling produces NaN rows", fix: "That is expected when upsampling - no observation exists in the new, shorter bins. Use .ffill() or .interpolate()." },
      { problem: "p + 2 does not give a date", fix: "You are adding to a Period, not a Timestamp. Period arithmetic moves by whole spans (months), Timestamp arithmetic moves by time." }
    ],
    viva: [
      { q: "What three levels of time precision does pandas support?", a: "Timestamps (a moment), periods (a fixed span) and intervals (a duration)." },
      { q: "Difference between tz_localize and tz_convert?", a: "tz_localize attaches a timezone to a naive index; tz_convert re-expresses an aware index in another timezone." },
      { q: "What is downsampling?", a: "Reducing the frequency, e.g. hourly data to 4-hourly, which reduces the number of rows." },
      { q: "Why does upsampling create NaN?", a: "The new, shorter bins contain no original observation, so the values are missing until you fill them." },
      { q: "How do you fix the gaps created by upsampling?", a: "Use .ffill() to carry the previous value forward, or .interpolate()." }
    ],
    related: [5, 7],
    tutorial: {
      searchQuery: "pandas time series date_range resample tz_localize tutorial beginners",
      note: "No recorded video exists in this project for this experiment, so a clearly labelled YouTube search link is provided instead."
    }
  },

  "7": {
    objectives: [
      "Split a DataFrame into groups with groupby().",
      "Group by one key and by several keys.",
      "Iterate over the groups and print each one.",
      "Compute summary statistics such as the mean marks per department and per department and year."
    ],
    theory: "groupby() is the split-apply-combine pattern: split the rows into groups, apply a function to each group " +
      "(mean, sum, count, max) and combine the results back into a table. The groups are keyed by the column or columns " +
      "you name. A single key gives one index level, several keys give a MultiIndex, and the aggregation then returns one " +
      "row per key combination. Iterating over the group object is the manual version of the same idea and is useful for " +
      "seeing what is inside each group.",
    algorithm: [
      "Create the DataFrame from a dictionary of lists.",
      "Group by one key: df.groupby('Department').",
      "Iterate over the groups and print each one.",
      "Aggregate: df.groupby('Department')['Marks'].mean().",
      "Group by two keys: df.groupby(['Department','Year']).",
      "Aggregate the two-key groups the same way."
    ],
    flowchart: [
      "  ┌──────────────────────┐",
      "  │ Build DataFrame      │",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐",
      "  │ SPLIT: groupby(key)  │",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐",
      "  │ APPLY: mean() / sum()│",
      "  └──────────┬───────────┘",
      "             ▼",
      "  ┌──────────────────────┐",
      "  │ COMBINE: one row per │",
      "  │ key (or per key pair)│",
      "  └──────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "df.groupby('Department') creates the groups; the for loop walks over (name, group) pairs, and ['Marks'].mean() reduces each group to a single number." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "SyntaxError near '*/'", fix: "The stored snippet contains stray comment markers ( */ ... */). Remove them or use the corrected version loaded with 'Load Example'." },
      { problem: "KeyError: 'Department'", fix: "The column name is misspelled or has a space. Print df.columns to see the exact names." },
      { problem: "The result is empty", fix: "A group key cannot be NaN, and the column you grouped on may hold numbers stored as text. Check df.dtypes." },
      { problem: "I want a single flat table instead of a MultiIndex", fix: "Call .reset_index() on the aggregated result." }
    ],
    viva: [
      { q: "What are the three steps of groupby?", a: "Split the data into groups, apply a function to each group, combine the results." },
      { q: "How do you group by two columns?", a: "df.groupby(['Department','Year'])" },
      { q: "How do you average one column per group?", a: "df.groupby('Department')['Marks'].mean()" },
      { q: "What does iterating over a group object give?", a: "A (name, group) pair for each group." }
    ],
    related: [4, 6],
    tutorial: {
      searchQuery: "pandas groupby split apply combine mean multiple keys tutorial",
      note: "No recorded video exists in this project for this experiment, so a clearly labelled YouTube search link is provided instead."
    }
  },

  "8": {
    objectives: [
      "Extract review blocks from a saved, authorised HTML page with Beautiful Soup.",
      "Store the extracted reviews in a CSV file with pandas.",
      "Explore the text with word clouds and length distributions.",
      "Score sentiment with NLTK VADER and the standalone VADER library.",
      "Plot the sentiment intensity of every review."
    ],
    theory: "Web scraping means reading the structure of an HTML page and pulling the parts you need. " +
      "Beautiful Soup parses HTML into a tree, and select() finds every element that matches a CSS selector. " +
      "This experiment reads a page that you saved yourself, which keeps the work reproducible and respects the " +
      "site's terms. The text is then analysed: a WordCloud shows the most frequent words, and VADER scores the " +
      "sentiment of each review from -1 (very negative) to +1 (very positive) using a lexicon of words with known " +
      "sentiment, including how the words are capitalised and whether punctuation such as '!' is used. " +
      "A compound score above 0.05 counts as positive and below -0.05 as negative.",
    algorithm: [
      "Save an authorised review page as reviews.html.",
      "Parse it with BeautifulSoup(html, 'html.parser').",
      "Select the review blocks and the text, rating and title inside them.",
      "Save the records to product_reviews.csv.",
      "Explore the text: word clouds for all, positive and negative reviews.",
      "Count stopwords, numbers, words, characters and average word length.",
      "Score each review with NLTK VADER and standalone VADER and classify the compound score.",
      "Plot the compound score per review with a scatter chart."
    ],
    flowchart: [
      "  ┌──────────────────────────┐",
      "  │ reviews.html (saved page) │",
      "  └────────────┬─────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐",
      "  │ BeautifulSoup parse      │",
      "  │ select('.review')        │",
      "  └────────────┬─────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐",
      "  │ product_reviews.csv      │",
      "  └────────────┬─────────────┘",
      "               ▼",
      "  ┌──────────────────────────┐   ┌──────────────────────┐",
      "  │ WordCloud + distributions│──▶│ VADER compound score │",
      "  └──────────────────────────┘   └──────────┬───────────┘",
      "                                          ▼",
      "  ┌───────────────────────────────────────────────┐",
      "  │ scatter plot: compound score per review index  │",
      "  └───────────────────────────────────────────────┘"
    ].join("\n"),
    notes: [
      { section: "A", text: "select('.review') finds every review block; select_one('.review-text') finds the text inside a block. get_text(' ', strip=True) returns clean text." },
      { section: "B", text: "WordCloud renders the most frequent words; the sentiment label column is saved for the next sections." },
      { section: "C", text: "re.findall splits the text into tokens, numbers and words; the counts are collected into a DataFrame and plotted with seaborn histograms." },
      { section: "D", text: "Both NLTK's VADER and the standalone vaderSentiment package are run so the two scores can be compared side by side." },
      { section: "E", text: "The scatter plot shows the compound score of every review with the +0.05 and -0.05 classification thresholds drawn as lines." }
    ],
    sampleInput: "",
    needsInput: false,
    troubleshooting: [
      { problem: "ModuleNotFoundError: No module named 'bs4' / 'nltk' / 'wordcloud'", fix: "These packages are not bundled with the browser sandbox. Install them locally with pip, or run the sections that only need pandas and matplotlib in the browser." },
      { problem: "FileNotFoundError: reviews.html", fix: "Save the review page you are allowed to use as reviews.html next to your script first." },
      { problem: "The extracted DataFrame is empty", fix: "The CSS selectors do not match the page. Open reviews.html, find the class names of the review blocks and update select() and select_one()." },
      { problem: "nltk.download fails in the browser", fix: "The NLTK data (stopwords, vader_lexicon) is downloaded from the internet. Download it once locally with nltk.download('vader_lexicon')." },
      { problem: "WordCloud shows one giant word", fix: "Give the text more variety; a small sample of reviews produces a very flat distribution." }
    ],
    viva: [
      { q: "What does Beautiful Soup do?", a: "It parses HTML into a tree that you can query with CSS selectors." },
      { q: "Why does the experiment read a saved HTML file instead of downloading a page?", a: "It keeps the run reproducible and respects the permissions and terms of the site." },
      { q: "What does the VADER compound score mean?", a: "A single normalised sentiment score from -1 (very negative) to +1 (very positive)." },
      { q: "What threshold turns a compound score into a label?", a: ">= 0.05 is Positive, <= -0.05 is Negative, anything between is Neutral." },
      { q: "What does a WordCloud visualise?", a: "The relative frequency of the words in a text, with bigger words being more frequent." }
    ],
    related: [3, 5],
    tutorial: {
      searchQuery: "python beautiful soup web scraping pandas nltk vader sentiment analysis tutorial",
      note: "No recorded video exists in this project for this experiment, so a clearly labelled YouTube search link is provided instead."
    }
  }
};

/* Corrected, runnable versions of the snippets whose stored source contains
   stray prose or comment markers. The original text stays untouched in
   assets/js/data.js; these are only offered through "Load Example". */
LAB_LEARN.fixedCode = {
  "6-C": [
    "import pandas as pd",
    "",
    "india_dates = pd.date_range(start='2026-01-01 09:00', periods=3, freq='h', tz='Asia/Kolkata')",
    "print('1. Date Range with Asia/Kolkata Time Zone:')",
    "print(india_dates)",
    "",
    "dates = pd.date_range(start='2026-01-01 09:00', periods=3, freq='h')",
    "print('\\n2. Timezone-naive Date Range:')",
    "print(dates)",
    "",
    "localized_dates = dates.tz_localize('Asia/Kolkata')",
    "print('\\n3. After Localizing to Asia/Kolkata:')",
    "print(localized_dates)",
    "",
    "new_york_dates = localized_dates.tz_convert('America/New_York')",
    "print('\\n4. Converted to America/New_York:')",
    "print(new_york_dates)",
    "",
    "india_series = pd.Series([100, 200, 300], index=localized_dates)",
    "new_york_series = pd.Series([400, 500, 600], index=new_york_dates)",
    "print('\\n5. India Time Series:')",
    "print(india_series)",
    "print('\\nNew York Time Series:')",
    "print(new_york_series)",
    "",
    "combined_series = pd.concat([india_series, new_york_series])",
    "print('\\n6. Combined Time Series:')",
    "print(combined_series)"
  ].join("\n"),

  "6-D": [
    "import pandas as pd",
    "",
    "p = pd.Period('2026-01', freq='M')",
    "print('Original Period:'); print(p)",
    "print('\\nAfter adding 2:'); print(p + 2)",
    "print('\\nAfter adding 5:'); print(p + 5)",
    "print('\\nAfter subtracting 1:'); print(p - 1)",
    "print('\\nAfter subtracting 3:'); print(p - 3)",
    "",
    "periods = pd.period_range(start='2026-01', periods=6, freq='M')",
    "print('\\nRange of Periods:'); print(periods)"
  ].join("\n"),

  "6-E": [
    "import pandas as pd",
    "",
    "p = pd.Period('2026-01', freq='M')",
    "print('Original Period:'); print(p)",
    "",
    "daily_start = p.asfreq('D', how='start')",
    "print('\\nMonthly Period converted to Daily (Start):'); print(daily_start)",
    "",
    "daily_end = p.asfreq('D', how='end')",
    "print('\\nMonthly Period converted to Daily (End):'); print(daily_end)",
    "",
    "period_index = pd.period_range(start='2026-01', periods=3, freq='M')",
    "print('\\nOriginal PeriodIndex:'); print(period_index)",
    "",
    "print('\\nPeriodIndex converted to Daily Frequency:')",
    "print(period_index.asfreq('D', how='start'))",
    "",
    "print('\\nPeriodIndex converted to Daily Frequency (End):')",
    "print(period_index.asfreq('D', how='end'))"
  ].join("\n"),

  "6-F": [
    "import pandas as pd",
    "",
    "dates = pd.to_datetime(['2026-01-10', '2026-02-15', '2026-03-20', '2026-04-25'])",
    "sales = pd.Series([1000, 1500, 1800, 2200], index=dates)",
    "print('Original Series:'); print(sales)",
    "",
    "period_series = sales.to_period('M')",
    "print('\\nSeries converted to Monthly Periods:'); print(period_series)",
    "",
    "df = pd.DataFrame({'Sales': [1000, 1500, 1800, 2200], 'Profit': [200, 300, 400, 500]}, index=dates)",
    "print('\\nOriginal DataFrame:'); print(df)",
    "",
    "period_df = df.to_period('M')",
    "print('\\nDataFrame converted to Monthly Periods:'); print(period_df)"
  ].join("\n"),

  "6-G": [
    "import pandas as pd",
    "",
    "dates = pd.date_range(start='2026-01-01 00:00', periods=12, freq='h')",
    "values = [10, 12, 15, 14, 18, 20, 22, 21, 25, 28, 30, 32]",
    "time_series = pd.Series(values, index=dates)",
    "print('Original Hourly Time Series:'); print(time_series)",
    "",
    "resampled = time_series.resample('3h').mean()",
    "print('\\nResampled Time Series - 3 Hour Mean:'); print(resampled)",
    "",
    "downsampled = time_series.resample('4h').sum()",
    "print('\\nDownsampled Time Series - 4 Hour Sum:'); print(downsampled)",
    "",
    "upsampled = time_series.resample('30min').asfreq()",
    "print('\\nUpsampled Time Series - 30 Minute:'); print(upsampled)",
    "",
    "upsampled_ffill = time_series.resample('30min').ffill()",
    "print('\\nUpsampled Time Series using Forward Fill:'); print(upsampled_ffill)"
  ].join("\n"),

  "7-A": [
    "import pandas as pd",
    "",
    "data = {",
    "    'Name': ['Ravi', 'Sita', 'Arun', 'Priya', 'Kiran', 'Anil', 'Lakshmi', 'Rahul'],",
    "    'Department': ['CSE', 'CSE', 'ECE', 'ECE', 'CSE', 'ECE', 'CSE', 'ECE'],",
    "    'Year': [2, 2, 3, 3, 2, 3, 3, 2],",
    "    'Marks': [85, 90, 78, 88, 75, 82, 95, 70]",
    "}",
    "",
    "df = pd.DataFrame(data)",
    "print('Original DataFrame:')",
    "print(df)",
    "",
    "# 1. Group by a SINGLE KEY",
    "print('\\n1. Group by Department:')",
    "group1 = df.groupby('Department')",
    "for name, group in group1:",
    "    print('\\nDepartment:', name)",
    "    print(group)",
    "",
    "print('\\nAverage Marks by Department:')",
    "print(df.groupby('Department')['Marks'].mean())",
    "",
    "# 2. Group by MULTIPLE KEYS",
    "print('\\n2. Group by Department and Year:')",
    "group2 = df.groupby(['Department', 'Year'])",
    "for name, group in group2:",
    "    print('\\nGroup:', name)",
    "    print(group)",
    "",
    "print('\\nAverage Marks by Department and Year:')",
    "print(df.groupby(['Department', 'Year'])['Marks'].mean())"
  ].join("\n"),

  "8-A": [
    "from bs4 import BeautifulSoup",
    "import pandas as pd",
    "",
    "# Save an authorised review page as reviews.html next to this script.",
    "with open('reviews.html', 'r', encoding='utf-8') as file:",
    "    html_content = file.read()",
    "",
    "soup = BeautifulSoup(html_content, 'html.parser')",
    "",
    "review_blocks = soup.select('.review')",
    "records = []",
    "",
    "for block in review_blocks:",
    "    review_element = block.select_one('.review-text')",
    "    rating_element = block.select_one('.rating')",
    "    title_element = block.select_one('.review-title')",
    "",
    "    review_text = review_element.get_text(' ', strip=True) if review_element else ''",
    "    rating_text = rating_element.get_text(' ', strip=True) if rating_element else ''",
    "    title = title_element.get_text(' ', strip=True) if title_element else ''",
    "",
    "    if review_text:",
    "        records.append({'title': title, 'review': review_text, 'rating': rating_text})",
    "",
    "df = pd.DataFrame(records)",
    "df.to_csv('product_reviews.csv', index=False, encoding='utf-8-sig')",
    "",
    "print(df.head())",
    "print('Total reviews extracted:', len(df))",
    "print('Saved to product_reviews.csv')"
  ].join("\n"),

  "8-B": [
    "# Run this after Experiment 1 (section A): it reads product_reviews.csv,",
    "# writes three WordClouds and saves the sentiment labels for the next sections.",
    "import pandas as pd",
    "import matplotlib.pyplot as plt",
    "from wordcloud import WordCloud",
    "from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer",
    "",
    "df = pd.read_csv('product_reviews.csv')",
    "df['review'] = df['review'].fillna('').astype(str)",
    "",
    "analyzer = SentimentIntensityAnalyzer()",
    "",
    "def classify_sentiment(text):",
    "    score = analyzer.polarity_scores(text)['compound']",
    "    if score >= 0.05:",
    "        return 'Positive'",
    "    elif score <= -0.05:",
    "        return 'Negative'",
    "    return 'Neutral'",
    "",
    "df['sentiment'] = df['review'].apply(classify_sentiment)",
    "",
    "def generate_wordcloud(text, title, filename):",
    "    if not text.strip():",
    "        print('No text available for: %s' % title)",
    "        return",
    "    cloud = WordCloud(width=1200, height=600, background_color='white',",
    "                     max_words=150, collocations=False).generate(text)",
    "    plt.figure(figsize=(12, 6))",
    "    plt.imshow(cloud, interpolation='bilinear')",
    "    plt.axis('off')",
    "    plt.title(title)",
    "    plt.tight_layout()",
    "    plt.savefig(filename, dpi=300, bbox_inches='tight')",
    "    plt.show()",
    "",
    "all_text = ' '.join(df['review'])",
    "generate_wordcloud(all_text, 'WordCloud - All Reviews', 'wordcloud_all.png')",
    "",
    "positive_text = ' '.join(df.loc[df['sentiment'] == 'Positive', 'review'])",
    "generate_wordcloud(positive_text, 'WordCloud - Positive Reviews', 'wordcloud_positive.png')",
    "",
    "negative_text = ' '.join(df.loc[df['sentiment'] == 'Negative', 'review'])",
    "generate_wordcloud(negative_text, 'WordCloud - Negative Reviews', 'wordcloud_negative.png')",
    "",
    "df.to_csv('product_reviews_analyzed.csv', index=False)",
    "print(df['sentiment'].value_counts())",
    "print('WordCloud images saved successfully.')"
  ].join("\n"),

  "8-E": [
    "# Run this after Section D: it reads sentiment_analysis_results.csv.",
    "import pandas as pd",
    "import matplotlib.pyplot as plt",
    "import seaborn as sns",
    "",
    "df = pd.read_csv('sentiment_analysis_results.csv')",
    "df['vader_compound'] = pd.to_numeric(df['vader_compound'], errors='coerce')",
    "df = df.dropna(subset=['vader_compound']).reset_index(drop=True)",
    "df['review_index'] = range(1, len(df) + 1)",
    "",
    "palette = {'Positive': 'green', 'Negative': 'red', 'Neutral': 'gray'}",
    "",
    "plt.figure(figsize=(14, 7))",
    "sns.scatterplot(data=df, x='review_index', y='vader_compound',",
    "                hue='vader_sentiment', palette=palette, s=70, alpha=0.8)",
    "plt.axhline(y=0.05, color='green', linestyle='--', label='Positive threshold')",
    "plt.axhline(y=-0.05, color='red', linestyle='--', label='Negative threshold')",
    "plt.axhline(y=0, color='black', linestyle=':', label='Neutral reference')",
    "plt.ylim(-1.05, 1.05)",
    "plt.xlabel('Review Index')",
    "plt.ylabel('VADER Compound Sentiment Score')",
    "plt.title('Sentiment Intensity of Product Reviews')",
    "plt.legend(loc='best')",
    "plt.grid(alpha=0.25)",
    "plt.tight_layout()",
    "plt.savefig('sentiment_intensity_scatter.png', dpi=300)",
    "plt.show()",
    "",
    "print('Scatter intensity plot saved successfully.')"
  ].join("\n")
};

if (typeof window !== 'undefined') window.LAB_LEARN = LAB_LEARN;
