var http = require('http');
var docopt = require('docopt');
var rest = require('restler');
var url = require('url');

var VERSION = '0.1dev';

var doc = "\
Usage:\n\
  jira_issue_cloner.js [-v] <jira_url> clone <sourceproject> <targetproject> [-u <username>]\n\
  jira_issue_cloner.js [-v] <jira_url> clear <project> [-u <username>]\n\
  jira_issue_cloner.js -h | --help | --version\n\
";


var options = docopt.docopt(doc, {version: VERSION});

if (options["-v"]) {
    console.log(options);
}

getCredentials(function(username, password) {
  
   options["<username>"] = username;
   options["<password>"] = password;
   

   if (options.clear) {
       clearProject(options["<project>"]);
   }
   
   if (options.clone) {
       cloneProject(options["<sourceproject>"],options["<targetproject>"]);
   }
   
   
});




function runInSequence(arrayOfFuncs, doneFunc) {
	
    var i = -1;
    var runner = function() {
        i++;
        if (i < arrayOfFuncs.length) {
            arrayOfFuncs[i](runner);
        } else {
            if (seqObject.done !== undefined) {
                seqObject.done();
            }
        }
        
    }
    var seqObject = {
        start: runner,
        done: doneFunc
    }
    return seqObject;
    
}


function errorHandler(error) {
    console.log(error);
    console.log(error.statusCode + " - " + error.statusText + " ["+error.path+"]");
    if (error.message !== undefined) {
        console.log(error.message);
    }
    process.exit();
}


function clearProject(project) {
           
            
    getProject(project, {
        error: errorHandler,
        success: function(projectObject) {
            console.log("Clearing project " + projectObject.key + " ("+projectObject.name+") as " + options["<username>"]);
   
   
            query("project=" + projectObject.key, {
                error: errorHandler,
                success: function(queryResponse) {
                
                    var delFunctions = [];
                    var issues = queryResponse.issues;
               
                    for (var i=0;i<issues.length;i++) {
                        delFunctions.push(function(issueObj) {
                            return function(next) {
                                deleteIssue(issueObj, {error: errorHandler}, next);
                            } 
                        }(issues[i]));
                    }
                    
                    var sequence = runInSequence(delFunctions, function() {
                        //onDone
                              
                        process.exit();
                    }).start();
                    
                               
                    
                }
            });
            
        }
    });
    
}

function cloneProject(source,target) {
	
    getProject(source, {
       success: function(sourceProject) {
          
           getProject(target, {
                success: function(targetProject) {
                  
                   	console.log("Cloning " + sourceProject.key + " ("+sourceProject.name+") to " + targetProject.key + " ("+targetProject.name+") as " + options["<username>"]);
              
                    query("project=" + sourceProject.key, {
                       success: function(queryResponse) {
                           
                           var addFunctions = [];
                           
                           var issues = queryResponse.issues;
                           
                           for (var i=0;i<issues.length;i++) {
                               var issue = issues[i];
                               
                               delete(issue.key);
                               delete(issue.self);
                               delete(issue.id);
                       
                               
                               //pick:
                               //issuetype, summary, priority, description
                               
                               var fields = {
                                   project: { "key": targetProject.key },
                                   issuetype: issue.fields.issuetype,
                                   summary: issue.fields.summary,
                                   priority: issue.fields.priority,
                                   
                               }
                               if (issue.fields.description != null) {
                                   fields.description = issue.fields.description;
                               }
                               
                               issue.fields = fields;
                               
                               
                               addFunctions.push(function(issueObj) {
                                  return function(next) {
                                      addIssue(issueObj, {error: errorHandler}, next);
                                  } 
                               }(issue));
                           }
                           
                           var sequence = runInSequence(addFunctions, function() {
                               //onDone
                              
                               process.exit();
                           }).start();
                         
                           
                           
                       },
                       error: errorHandler
                        
                    });
              
                 
                    
                },
                error: errorHandler
           });
           
       },
       error: errorHandler
        
    });
    
}
function addIssue(issueObj, cb, next) {

    var requestURL = options["<jira_url>"] + "/rest/api/2/issue/";
    
    console.log("Adding issue: \n" + JSON.stringify(issueObj) + "\n" );
    rest.postJson( requestURL, issueObj, {username: options["<username>"], password: options["<password>"]}).on('complete', function(result, response) {
       
        if (cb !== null) {
            if (response.statusCode == 201) {
                if (cb.success !== undefined) {
                    cb.success(result);
                }
            } else {
                
        
                if (cb.error !== undefined) {
                    cb.error({
                        path: response.req.path,
                        statusCode: response.statusCode,
                        statusText: http.STATUS_CODES[response.statusCode],
                        message: result
                    });
                }
            }
        }
        
        next();
    });
        
}

function deleteIssue(issueObj, cb, next) {
    var requestURL = options["<jira_url>"] + "/rest/api/2/issue/" + issueObj.key;
    console.log("DELETE: " + requestURL);
    rest.del( requestURL, {username: options["<username>"], password: options["<password>"]}).on('complete', function(result, response) {
  
       
       if (cb !== null) {
            if (response.statusCode == 204) {
                if (cb.success !== undefined) {
                    cb.success(result);
                }
            } else {
                
                if (cb.error !== undefined) {
                    cb.error({
                        path: response.req.path,
                        statusCode: response.statusCode,
                        statusText: http.STATUS_CODES[response.statusCode],
                        message: result
                    });
                }
            }
        }
       
        next();
        
    });
}

function getProject(key, cb) {
    
    var requestURL = options["<jira_url>"] + "/rest/api/2/project/" + key;
    console.log("Loading project: " + requestURL);

    rest.get( requestURL, {username: options["<username>"], password: options["<password>"]}).on('complete', function(result, response) {
       
        if (response.statusCode == 200) {
            cb.success(result);
        } else {
       
            cb.error({
                path: response.req.path,
                statusCode: response.statusCode,
                statusText: http.STATUS_CODES[response.statusCode]
            });
        }
     
        
    });
}
function query(jql, cb) {
    
    var requestURL = options["<jira_url>"] + "/rest/api/2/search?jql=" + jql + "&maxResults=-1";
    
       rest.get( requestURL, {username: options["<username>"], password: options["<password>"]}).on('complete', function(result, response) {
       
        if (response.statusCode == 200) {
            cb.success(result);
        } else {
            cb.error({
                path: response.req.path,
                statusCode: response.statusCode,
                statusText: http.STATUS_CODES[response.statusCode]
            });
        }
     
    });
}


function getCredentials(cb) {

	if (!options["-u"]) {
		queryUser("Username:", false, function(username) {
			
			getPassword(function(pw) {
	
                cb(username, pw);
				
			});
		});
	} else {

		getPassword(function(pw) {
			cb(options["<username>"], pw);
		});
	}
}

function getPassword(cb) {
	
	queryUser("Password:", true, function(response) {
		cb(response);
	});
	
}


function queryUser(question, isSecret, cb) {
	
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	
	process.stdout.write(question + " ");
	var data = "";
	
	var keyListener = function( key ) {
		// ctrl-c ( end of text )
		if ( key === '\u0003' ) {
			process.exit();
		}
		if (key === '\u000D') {
			process.stdin.removeListener('data', keyListener);
            process.stdout.write('\r\n');
            process.stdin.pause();
    
			return cb(data);
		} else {
			data += key;
			if (!isSecret) process.stdout.write(key);
		}
	};
    
	process.stdin.on('data', keyListener);
	
}
