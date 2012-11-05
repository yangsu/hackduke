# Duke Connect Script
# How to use: Call from command line and pass as args Netid and Password
# ex: ~ ruby mechanize.rb flb5 mypassword
# returns JSON object of students classes

require 'mechanize'
require 'logger'
require 'json'

a = Mechanize.new 
a.user_agent_alias = 'Mac Safari'
a.agent.redirect_ok = :all, true
a.ssl_version = 'SSLv3'
a.verify_mode = OpenSSL::SSL::VERIFY_NONE

a.log = Logger.new "mech.log"

a.get('https://www.siss.duke.edu/psp/CSPRD01/?cmd=start') do |page|

  # Submit the login form
  my_page = page.form_with(:action => '/idp/authn/external') do |f|
    f.field_with(:id => "j_username").value = ARGV[0]
    f.field_with(:id => "j_password").value = ARGV[1]
  end.submit

  form = my_page.forms.first

  final = form.submit


  courses = Array.new()
  a.get('https://www.siss.duke.edu/psp/CSPRD01/EMPLOYEE/HRMS/h/?cmd=getCachedPglt&pageletname=HC_STUDENT_CENTER_HOME&tab=DEFAULT&PORTALPARAM_COMPWIDTH=Narrow&ptlayout=N') do |page|
    page.search('span[@class="PSHYPERLINKDISABLED"][@title="View Details"]').each do |link|
      course_info = link.content
      course_info["\n"]= " "
      courses << course_info
      #puts link.content
    end
  end

  puts courses.to_json


  '''
  my_page.links.each do |link|
    text = link.text.strip
    next unless text.length > 0
    puts text
  end
  '''
end