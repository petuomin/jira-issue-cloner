# JIRA issue cloning tool



A command line tool for cloning jira issues between projects. Written in javascript for node.js.


    Usage:
      jira_issue_cloner.js [-v] <jira_url> clone <sourceproject> <targetproject> [-u <username>]
      jira_issue_cloner.js [-v] <jira_url> clear <project> [-u <username>]
      jira_issue_cloner.js -h | --help | --version


<b>clone</b><br/>
Copies issues from sourceproject to targetproject. 

Copied attributes are issuetype, summary, priority, description. This means that much of the metadata won't be copied.

<b>clear</b><br/>
Deletes all issues from a project.



## License (MIT)

Copyright (C) 2012 The National Library of Finland

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
