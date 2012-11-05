require 'rubygems'
require 'mechanize'
require 'logger'

a = Mechanize.new 
a.user_agent_alias = 'Mac Safari'
a.agent.redirect_ok = :all, true
a.ssl_version = 'SSLv3'
a.verify_mode = OpenSSL::SSL::VERIFY_NONE

a.log = Logger.new "mech.log"

a.get('https://www.siss.duke.edu/psp/CSPRD01/?cmd=start') do |page|

  # Submit the login form
  my_page = page.form_with(:action => '/idp/authn/external') do |f|
    #f.j_username  = 'flb5' #ARGV[0]
    f.field_with(:id => "j_username").value = 'NETID'
    #f.j_password  = 'handyArmsWursti7' #ARGV[1]
    f.field_with(:id => "j_password").value = 'PASSWORD'
  end.submit

  form = my_page.forms.first

  final = form.submit

  a.get('https://www.siss.duke.edu/psp/CSPRD01/EMPLOYEE/HRMS/h/?tab=DEFAULT') do |page|
    puts page.body
  end

  '''
  my_page.links.each do |link|
    text = link.text.strip
    next unless text.length > 0
    puts text
  end
  '''
end