JIRA issue cloning tool
-----------------------


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
