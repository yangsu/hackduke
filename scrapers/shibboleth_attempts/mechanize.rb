# Using Mechanize in Ruby
# ISSUE:  SCRIPT TIMES OUT WHEN TRYING TO GET LOGIN PAGE. ERROR UNKNOWN

require 'rubygems'
require 'mechanize'

a = Mechanize.new
a.get('https://www.siss.duke.edu/psp/CSPRD01/?cmd=start') do |page|

  puts page.inspect

  # Submit the login form
  my_page = login_page.form_with(:action => '/idp/authn/external') do |f|
    #f.j_username  = 'flb5' #ARGV[0]
    f.field_with(:id => "j_username").value = 'NETID HERE'
    #f.j_password  = 'handyArmsWursti7' #ARGV[1]
    f.field_with(:id => "j_password").value = 'PASSWORD HERE'
  end.submit

  my_page.links.each do |link|
    text = link.text.strip
    next unless text.length > 0
    puts text
  end
end