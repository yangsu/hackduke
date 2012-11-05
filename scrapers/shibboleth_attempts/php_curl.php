<?php
// Attempt using PHP Curl
// ISSUE: Second Curl request does not lead to "_idp_authn_ls_key" cookie update. Full script returns to Login Form

//Initial Get Login Page

$ch = curl_init("https://www.siss.duke.edu/psp/CSPRD01/?cmd=start");

curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); 

curl_exec($ch);
echo curl_getinfo($ch, CURLINFO_HEADER_OUT);
echo curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "<br />";
curl_close($ch);

//Testing cookies 

$file_handle = fopen("cookies.txt", "r");
$i = 1;
while (!feof($file_handle)) {
	$line = fgets($file_handle);
	if($i == 8) {
  		 echo $line."<br />";
	}
	$i++;
}
fclose($file_handle);

//Add the garbage cookie to the request
$myFile = "cookies.txt";
$fh = fopen($myFile, 'a') or die("can't open file");
$stringData = "shib.oit.duke.edu	FALSE	/idp	TRUE	0	_idp_session	garbage";
fwrite($fh, $stringData);
fclose($fh);


//Second call, get updated _idp_authn_ls_key

$ch = curl_init("https://shib.oit.duke.edu/idp/AuthnEngine");

curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); 

curl_exec($ch);
echo curl_getinfo($ch, CURLINFO_HEADER_OUT);
echo curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "<br />";
curl_close($ch);


// Send J_username_prefMech just to get 200 ok from server. Maybe sets something in backend...

$data = array('j_username_prefMech' => 'flb5');

$ch = curl_init("https://shib.oit.duke.edu/idp/authn/external");

curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); 

curl_exec($ch);
echo curl_getinfo($ch, CURLINFO_HEADER_OUT);
echo curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "<br />";
curl_close($ch);



$data = array('j_username' => 'NETID HERE', 'j_password' => 'PASSWORD HERE', 'Submit' => 'Enter');

$ch = curl_init("https://shib.oit.duke.edu/idp/authn/external");

curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
//curl_setopt($ch, CURLOPT_COOKIESESSION, 1);
curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
//curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);

curl_exec($ch);
echo curl_getinfo($ch, CURLINFO_HEADER_OUT);
echo curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);



?>