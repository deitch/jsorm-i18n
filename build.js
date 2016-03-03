/*jslint node:true */
/*global directory, file, task, desc */


/*
 * To Do:
 * - build zip() function
 * - options for copy, minify, concat, zip; or maybe just use filelist task?
 * 
 */
// required modules
var fs = require('fs'), path = require('path'), uglify = require('uglify-js'), spawn = require('child_process'),
  copy, concat, minify, replace, del, zip, exec;

// global vars
// latest version of jsorm.i18n we are working with
var zoneversion = "2009u",
	// latest version of i18n we are working with
	version = "2.0.2",
  src = "./src/",
  core = src+"core",
  calendars = src+"calendars",
  locale = src+"locale",
  build = "./build",
  buildnode = "./buildnode",
  test = "./test",
  samples = "./samples",
  caldest = build+"/calendars",
  localdest = build+"/locale",
  dist = "./dist",
  basefile = "jsorm-i18n",
  expfile = basefile+"-src.js",
  minfile = basefile+".js",
  distfile_all = dist+"/"+basefile+"-"+version+".zip",
  distfile_zoneinfo = dist+"/"+basefile+"-zoneinfo-"+zoneversion+".zip",
  distfile_base = dist+"/"+basefile+"-"+version+"-base.zip",
  srcfiles = ["00base.js","resource-bundle.js","currency.js","timezone.js","calendar.js","json2.js"],
  zonebuild = build+"/zoneinfo",
  zoneinfo = "./zoneinfo",
  zonecompiler = src+"/zoneinfo/compile_zoneinfo.rb",
  zonevalidater = src+"/zoneinfo/process_binary_zi.rb",
  privatedoc = src+"/doc/private",
  doc = build+"/doc",
  jsdochome = "../jsdoc_toolkit-1.4.0mod",
  jsdoc = jsdochome+"/jsdoc",
  testhtml = "test/test.html";


concat = function(target,src){
  var stream;
  src = src || [];
  if (target) {
    // open the file for writing
    stream = fs.createWriteStream(target,{flags:'w'});
    src.forEach(function(file){
      // write each file in order to the stream
      stream.write(fs.readFileSync(file));
    });
    stream.end();
    stream.destroy();
  }
};

copy = function(target,src,options) {
  // need to have options for {deep:true,excludes:'',includes:''}

  var doWrite = function(t,d) {
    var stream;
    // open the file for writing
    stream = fs.createWriteStream(t,{flags:'w'});
    // write each file in order to the stream
    stream.write(d);
    stream.end();
    stream.destroy();
  };
  src = [].concat(src || []);
  target = [].concat(target || []);
  src.forEach(function(file){
    var stream, stats, data, tmp;
    // is file a file, a directory, or nothing?
    stats = fs.statSync(file);
    if (stats.isFile()) {
      data = fs.readFileSync(file);
      target.forEach(function(dir){
        doWrite(dir+"/"+path.basename(file),data);
      });
    } else if (stats.isDirectory()) {
      // list all files in the directory and copy them one by one
      tmp = [];
      (fs.readdirSync(file) || []).forEach(function(f){
        var stats = fs.statSync(f);
        if (stats.isFile()) {
          target.forEach(function(dir){
            doWrite(dir+"/"+path.basename(f),file+"/"+f);
          });
        }
      });
    }
  });
};

replace = function(file,orig,repl) {
  var data = fs.readFileSync(file,'utf8');
  data = data.replace(orig,repl);
  fs.writeFileSync(file,data,'utf8');
};

minify = function(target,src,options) {
  var jsp = uglify.parser, pro = uglify.uglify, ast, orig, output;
  options = options || {};

  // need to have src be [] or individual
  // need to have src be directory or file
  // need to have options have includes/excludes

  orig = fs.readFileSync(src,'utf8');
  ast = jsp.parse(orig); // parse code and get the initial AST
  ast = pro.ast_mangle(ast); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
  output = pro.gen_code(ast); // compressed code here

  fs.writeFileSync(target,output,'utf8');

};

del = function(target) {
  target = [].concat(target || []);
  target.forEach(function(f) {
    fs.unlinkSync(f);
  });
};

zip = function(target,src,options) {
  
};

exec = function(cmd,opts,config,cb) {
  var co = spawn.spawn(cmd,opts,config||{});
  if (cb && typeof(cb) === "function") {
    co.on("exit",cb);
  }
};


// <property file="build.properties"/>
//<property name="compile.debug" value="true"/>
task("core",["init"],"Core build task",function(){
  // combine the files into build/ and minify
  var files = [], target = build+"/"+expfile+".js", mintarget = build+"/"+expfile+"-min.js";
  files.push(src+"00license.js",core+"/000pre.js");
  srcfiles.forEach(function(file){
    files.push(src+file);
  });
  files.push(core+"/000post.js");
  file(target,files,function(){
    // concat here
    concat(target,files);

    // replace - add the version strings to the file
    replace(target,"@@version@@",version);

    // minify the file
    minify(target,build+"/tmp-minfile.js");

    // add the license to the minified file
    concat(mintarget,[src+"/00license.js",build+"/tmp-minfile.js"]);

    // remove the temporary file
    fs.unlinkSync(build+"/tmp-minfile.js");
    
    // copy - copy the minified and non-minified versions to the test and sample directories
    copy([test,samples],[target,mintarget]);

    // set up the node-ready version
    directory(buildnode+"/lib");
    copy(buildnode+"/lib",build+"/"+minfile);
    copy(buildnode,"package.json");
    replace(buildnode+"/package.json","@@version@@",version);
  });
  
});

task("init","initializes all directories",function(){
  directory([build,build+"/calendars",build+"/zoneinfo",buildnode,buildnode+"/calendars",buildnode+"/zoneinfo",caldest,dist]);
});

task("dist",["build","zoneinfo","locale","doc","zip"]);
task("build",["core","calendars","doc"]);

task("alldoc",["doc","privatedoc"]);

task("locale",["init"],function(){
  copy(localdest,locale);
});

task("clean","Removed previous build",function(){
  del([build,buildnode,privatedoc,zonebuild,dist]);
});
task("cleandist",["clean","dist"]);

task("calendars",["init"],function(){
  minify(build+"/calendars",calendars,{includes:"*.json"});
  copy(buildnode,build,{includes:"calendars/**"});
  copy(samples,build,{includes:"calendars/*.json"});
});

task("zip",function(){
  zip(distfile_all,build);
  zip(distfile_zoneinfo,build,{includes:"zoneinfo/**"});
  zip(distfile_base,build,{excludes:"zoneinfo/"});
});

task("zoneinfo",["init"],function(){
  exec(zonecompiler,[zoneinfo+"/"+zoneversion,zonebuild],{env:{RUBYLIB:src+"/zoneinfo"}},function(){
    copy(buildnode,[build,samples],{includes:"zoneinfo/**"});
  });
});

task("validatezoneinfo",["zoneinfo","nativezoneinfo"],function(){
  var co = spawn.spawn(zonevalidater,[zonebuild,zoneinfo+"/"+zoneversion+"/build/etc/zoneinfo","./test/zoneinfo/out"],{env:{RUBYLIB:src+"/zoneinfo"}});
});  

task("nativezoneinfo",function(){
  var co;
  directory(zoneinfo+"/"+zoneversion+"/build");
  co = spawn.spawn("make",["TOPDIR=../../../"+zoneinfo+"/"+zoneversion+"/build","CC=gcc","CFLAGS=-DSTD_INSPIRED","install"],{cwd:zoneinfo+"/"+zoneversion+"/src"});
});
