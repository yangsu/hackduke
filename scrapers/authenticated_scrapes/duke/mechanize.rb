# Duke Data Script
# Author: Fabio Lucas Berger
# How to use: Call from command line and pass as args Netid, Password & parameters comma separated
# ex: ~ ruby mechanize.rb flb5 mypassword transcript
# returns JSON object of student info

require 'mechanize'
# require 'logger' #only needed if logging activity
require 'json'

possible_perms = ['schedule', 'basic_info', 'advanced_info', 'transcript'];

# pass in terminal params
netid = ARGV[0]
pass = ARGV[1]
perms = ARGV[2]

perm_array = perms.split(",");

# init mechanize
a = Mechanize.new 
a.user_agent_alias = 'Mac Safari'
a.agent.redirect_ok = :all, true
a.ssl_version = 'SSLv3'
a.verify_mode = OpenSSL::SSL::VERIFY_NONE

# uncomment this to get logs
#a.log = Logger.new "mech.log"

a.get('https://www.siss.duke.edu/psp/CSPRD01/?cmd=start') do |page|

  # Submit the login form
  my_page = page.form_with(:action => '/idp/authn/external') do |f|
    f.field_with(:id => "j_username").value = netid
    f.field_with(:id => "j_password").value = pass
  end.submit

  form = my_page.forms.first

  final = form.submit

  # begin selective parsing

  result = Hash.new();
  result['netid'] = netid

  for perm in perm_array do

    if possible_perms.include?(perm) and (perm == 'schedule' || perm == 'basic_info' || perm == 'advanced_info')

      a.get('https://www.siss.duke.edu/psp/CSPRD01/EMPLOYEE/HRMS/h/?cmd=getCachedPglt&pageletname=HC_STUDENT_CENTER_HOME&tab=DEFAULT&PORTALPARAM_COMPWIDTH=Narrow&ptlayout=N') do |page|
        
        if perm == 'schedule'
          courses = Array.new()
          page.search('span[@class="PSHYPERLINKDISABLED"][@title="View Details"]').each do |link|
            course_info = link.content
            course_info["\n"]= " "
            courses << course_info
          end
          result['schedule'] = courses
        end
        if perm == 'basic_info'
          infos = Hash.new();
          page.search('span[@id="DERIVED_SCC_SUM_PERSON_NAME"]').each do |span|
            name = span.content
            infos['name'] = name
          end
          page.search('span[@id="DERIVED_SSS_SCL_EMAIL_ADDR"]').each do |span|
            email = span.content
            infos['email'] = email
          end
          result['basic_info'] = infos
        end
        if perm == 'advanced_info'
          adv_infos = Hash.new();
          page.search('span[@id="DERIVED_SSS_SCL_DESCR50"]').each do |span|
            phone = span.content
            adv_infos['phone'] = phone
          end
          result['advanced_info'] = adv_infos
        end
      end

    end

    if possible_perms.include?(perm) and (perm == 'transcript')

      a.get('https://www.siss.duke.edu/psc/CSPRD01/EMPLOYEE/HRMS/c/DU_SELFSERVICE.DU_SSS_ACAD_HIST.GBL?Page=DU_SSS_ACAD_HIST&Action=U') do |page|

        transcript = Hash.new()

        # Get program information
        program_info = Hash.new()
        program_info['program_status'] = page.search('//span[@id[contains(., "DU_AH_PROG_VW_PROG_STATUS$")]]').text
        program_info['programs'] = Array.new()
        page.search('//span[@id[contains(., "ACAD_PLAN_TBL_DESCR$")]]').each do |program|
          program_info['programs'] << program.text
        end
        program_info['admit_term'] = page.search('//span[@id[contains(., "TERM_VAL_TBL_DESCR$")]]').text
        program_info['exp_graduation'] = page.search('//span[@id[contains(., "EXP_GRAD_DESC$")]]').text

        transcript['program_info'] = program_info

        # Get high school credits
        hs_credits = Array.new()
        page.search('//tr[@id[contains(., "trDU_AH_XFRCRD_VW$")]]').each do |credit|
            hs_credit = Hash.new()
            hs_credit['institution'] = credit.xpath('.//span[@id[contains(., "DU_AH_DERIVED_SRC_ORG_NAME$")]]').text
            hs_credit['equivalent_course'] = credit.xpath('.//span[@id[contains(., "DU_AH_DERIVED_DU_AH_COURSE$")]]').text
            hs_credit['description'] = credit.xpath('.//span[@id[contains(., "CRSE_CATALOG_DESCR$")]]').text
            hs_credit['official_grade'] = credit.xpath('.//span[@id[contains(., "DU_AH_XFRCRD_VW_CRSE_GRADE_OFF$")]]').text
            hs_credit['units_transferred'] = credit.xpath('.//span[@id[contains(., "DU_AH_XFRCRD_VW_UNT_TRNSFR$")]]').text 
            hs_credits << hs_credit
        end

        transcript['highschool_credits'] = hs_credits

        courses = Hash.new()
        #iterate over each term and get course info
        page.search('//table[@class[contains(., "PSLEVEL1SCROLLAREABODYNBOWBO")]]').each do |term_info|

          term = term_info.xpath('.//div[@id[contains(., "win0divGPDU_AH_DERIVED_GROUPBOX3$")]]').text
          courses[term] = Array.new()

          #iterate over each course and get all its info
          term_info.xpath('.//tr[@id[contains(., "trCLASS_GRID$")]]').each do |class_info| 
            course = Hash.new()
            course['course'] = class_info.xpath('.//span[@id[contains(., "DU_AH_DERIVED_DU_AH_COURSE$")]]').text
            course['title'] = class_info.xpath('.//div[@id[contains(., "win0divDU_AH_DERIVED_DU_AH_CRSE_TITLE$")]]/div/font').text
            course['instructor'] = class_info.xpath('.//div[@id[contains(., "win0divDU_AH_DERIVED_DU_AH_INSTRUCTORS$")]]/div/font').text
            course['official_grade'] = class_info.xpath('.//div[@id[contains(., "win0divGRADE_FIELD$")]]/span').text
            course['units'] = class_info.xpath('.//span[@id[contains(., "CLASS_TBL_SE_VW_UNT_TAKEN$")]]').text
            course['grading_basis'] = class_info.xpath('.//div[@id[contains(., "win0divGB_LINK$")]]/span/a').text
            courses[term] << course
          end
          
        end

        transcript['courses'] = courses
        
        result['transcript'] = transcript

      end

    end

  end

  puts result.to_json

end