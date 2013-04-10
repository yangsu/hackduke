# Duke Connect Script
# How to use: Call from command line and pass as args Netid and Password
# ex: ~ ruby mechanize.rb flb5 mypassword
# returns JSON object of students classes

require 'mechanize'
require 'nokogiri'
# require 'logger'
require 'json'

possible_perms = ['schedule', 'basic_info', 'advanced_info'];

netid = ARGV[0]
pass = ARGV[1]
perms = ARGV[2]

perm_array = perms.split(",");

a = Mechanize.new 
a.user_agent_alias = 'Mac Safari'
a.agent.redirect_ok = :all, true
a.ssl_version = 'SSLv3'
a.verify_mode = OpenSSL::SSL::VERIFY_NONE

# uncomment this to get logs
#a.log = Logger.new "mech.log"

a.get('https://medley.isc-seo.upenn.edu/pennInTouch/jsp/fast.do?1=2&amp;access=student') do |page|

  puts page.apply_to(html).to_s

  page.links.each do |link|
    puts link.text
  end

  # Submit the login form
  # final_page = page.form_with(:name => 'loginform') do |f|
  #   f.field_with(:id => "pennkey").value = netid
  #   f.field_with(:id => "password").value = pass
  # end.submit

  # form = my_page.forms.first

  # final = form.submit


  # begin selective parsing

  # result = Hash.new();
  # result['netid'] = netid

  # for perm in perm_array do

  #   if possible_perms.include?(perm) and (perm == 'schedule' || perm == 'basic_info' || perm == 'advanced_info')

  #     a.get('https://cc.unc.edu/psp/campus/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL') do |page|
        
  #       if perm == 'schedule'
  #         courses = Array.new()
  #         page.search('span[@class="PSHYPERLINKDISABLED"][@title="View Details"]').each do |link|
  #           course_info = link.content
  #           course_info["\n"]= " "
  #           courses << course_info
  #         end
  #         result['schedule'] = courses
  #       end
  #       if perm == 'basic_info'
  #         infos = Hash.new();
  #         page.search('span[@id="DERIVED_SCC_SUM_PERSON_NAME"]').each do |span|
  #           name = span.content
  #           infos['name'] = name
  #         end
  #         page.search('span[@id="DERIVED_SSS_SCL_EMAIL_ADDR"]').each do |span|
  #           email = span.content
  #           infos['email'] = email
  #         end
  #         result['basic_info'] = infos
  #       end
  #       if perm == 'advanced_info'
  #         adv_infos = Hash.new();
  #         page.search('span[@id="DERIVED_SSS_SCL_DESCR50"]').each do |span|
  #           phone = span.content
  #           adv_infos['phone'] = phone
  #         end
  #         result['advanced_info'] = adv_infos
  #       end
  #     end

  #   end

  # end

  # puts result.to_json


end