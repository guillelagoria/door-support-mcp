# Automated Access

**ID:** 24636326626199
**Created:** 2024-07-03T20:01:58Z
**Updated:** 2025-08-08T19:16:35Z
**URL:** https://support.door.com/hc/en-us/articles/24636326626199-Automated-Access

---

<p>The Automated Access Automation is a feature available within <span class="wysiwyg-underline"><strong><a href="https://app.door.com/">DOOR OS</a></strong></span> that automatically adjusts resident access in DOOR based on changes within your ePMS system. This feature is designed to streamline your property management operations by removing the need to manually assign access to residents once they’re added to your ePMS system.</p>
<h3 id="h_01HC2YRQ0VTBP43W7371FDQQF0">When is resident access provisioned through Automated Access integration?</h3>
<p>The resident access is provisioned when you update a resident's lease status to "current" in the PMS. Once the system detects this change, it assigns access to that resident with a start time of 15 minutes after the status change is detected.</p>
<h3 id="h_01HC2YRQ0VATWVS20WQEZA7VP5">When is resident access revoked through Automated Access integration?</h3>
<p>The resident's access is revoked when you update a resident's lease status to "past" in the PMS. Once the system detects this change, it revokes access to that resident within minutes. </p>
<h3 id="h_01JJW1H6RMSZF5BCEBG6EBC60F"><span class="s1">Setting Up Automated Access</span></h3>
<p>Follow these steps to set up Automated Access for your property:</p>
<h3 id="h_01HC2YVGY8YJKCJ363QR3TZG73">Step 1: Verify User Sync Is Enabled</h3>
<p>Make sure that User Sync is enabled for your property. Follow these <a href="https://support.latch.com/hc/en-us/articles/16099221835543-Setting-up-ePMS-in-Latch-Mission-Control"><span class="wysiwyg-underline"><strong>steps</strong></span></a> to verify.</p>
<h3 id="h_01JJW1HG82PS4TXS1J3QK4PCKZ">Step 2: Create Common Area Keys (Optional)</h3>
<p>Common Area Keys are shared with all current residents. We recommend creating two sets of Common Area Keys:</p>
<ol>
<li>
<strong>Residents Entrance</strong> - Include all doors that enable residents to reach their front door (Entrance, Elevators, Emergency Exits, Stairs, etc.).</li>
<li>
<strong>Residents Amenities</strong> - Include all doors leading to amenities.</li>
</ol>
<p><strong>Note:</strong> These keys can be shareable or not, depending on your preference.</p>
<h3 id="h_01HC2YWXYKT1SZEK3PQ9RN80J9">Step 3: Request Integration</h3>
<p>Request the integration by following one of these methods:</p>
<ul>
<li style="list-style-type: none;">
<ul>
<li>Go to the 'Integrations' tab in your DOOR OS and follow the integration setup steps.</li>
<li>Reach out to our support team at <span class="wysiwyg-underline"><strong><a href="mailto:support@door.com">support@door.com</a></strong></span> for assistance with integration.</li>
</ul>
</li>
</ul>
<h3 id="h_01HC2YRQ0V6HD21APNTFQQ2JDS">Operation Mode</h3>
<p>The default operation mode for the Automated Access integration is "Approval Required". In this mode, all access suggestions need to be reviewed by property managers in the DOOR OS before they take effect. <strong>No changes will be made to resident access until property managers review and approve the access suggestions.</strong></p>
<p>If any access suggestions need to be corrected, property managers should not approve them and instead reach out to <strong><span class="wysiwyg-underline"><a href="mailto:support@door.com">support@door.com</a></span></strong><span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;"> </span>for assistance. We're happy to help make the necessary changes to ensure everything runs smoothly.</p>
<h3 id="h_01HC2YRQ0VQ1W7QMQV44RFK6FM">Changing the Operation Mode</h3>
<p>If you would like to change the mode of operation, follow these steps:</p>
<ol>
<li>Navigate to the Manage Settings tab and select "Integrations"</li>
<li>Click on "Manage Settings"</li>
<li>Select the "Automate Access" tab</li>
<li>Choose your preferred operation mode from the drop-down menu</li>
<li>Click "Save" to confirm the update</li>
</ol>
<div class="group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 bg-gray-50 dark:bg-[#444654]">
<div class="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto">
<div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
<div class="flex flex-grow flex-col gap-3">
<div class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
<div class="markdown prose w-full break-words dark:prose-invert light">
<p>Note: We recommend starting with "Approval Required" mode to ensure that the Automated Access integration is working as expected. In this mode, property managers must review and approve all access suggestions before they take effect. Once you're comfortable with the integration, you can change the operation mode as needed.</p>
<p><span style="font-size: 1.2em; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">Automated Access - Working Scenarios</span></p>
</div>
</div>
</div>
</div>
</div>
</div>
<p class="p1">The following status labels within your ePMS system will automatically result in the following changes in the DOOR OS:</p>
<table style="width: 664.125px; height: 110px;" border="1" cellspacing="10px" cellpadding="10px">
<thead>
<tr class="wysiwyg-text-align-center" style="height: 22px;">
<td style="width: 165.781px; height: 22px;">
<h4 id="h_01HC2YRQ0VDVDWNAAEX7TK51DS"><strong><span class="wysiwyg-underline wysiwyg-bold">ePMS Status Label</span></strong></h4>
</td>
<td style="width: 497.344px; height: 22px;">
<h4 id="h_01HC2YRQ0VF5XDTP2AX10DG6BN"><strong><span class="wysiwyg-underline wysiwyg-bold">DOOR OS Change</span></strong></h4>
</td>
</tr>
</thead>
<tbody>
<tr style="height: 22px;">
<td style="width: 165.781px; height: 22px;">Future Resident</td>
<td style="width: 497.344px; height: 22px;">No access is assigned.</td>
</tr>
<tr style="height: 22px;">
<td style="width: 165.781px; height: 22px;">Current Resident</td>
<td style="width: 497.344px; height: 22px;">Resident access is automatically assigned based on the resident’s unit in your ePMS system.</td>
</tr>
<tr style="height: 22px;">
<td style="width: 165.781px; height: 22px;">Unit Change</td>
<td style="width: 497.344px; height: 22px;">Resident access is updated based on the resident’s unit change in your ePMS system.</td>
</tr>
<tr style="height: 22px;">
<td style="width: 165.781px; height: 22px;">Past Resident</td>
<td style="width: 497.344px; height: 22px;">All access is revoked.</td>
</tr>
</tbody>
</table>
<p class="p1"><br>As a Portfolio or Property Manager, you will still be able to manually revoke or add specific door access within the DOOR OS. This can be done for both residents and non-residents.</p>
<p class="p1">You can also manually adjust a resident’s status label with the DOOR OS. The changes below will result in the following:</p>
<table style="width: 664.125px; height: 88px;" border="1" cellspacing="10px" cellpadding="10px">
<tbody>
<tr style="height: 22px;">
<td class="wysiwyg-text-align-center" style="width: 331.562px; height: 22px;">
<h4 id="h_01HC2YRQ0VBE8VKQBYVPT51VTN"><span class="wysiwyg-underline"><strong>DOOR OS Status Change</strong></span></h4>
</td>
<td class="wysiwyg-text-align-center" style="width: 331.562px; height: 22px;">
<h4 id="h_01HC2YRQ0V3BV94XBTV108WMYC"><span class="wysiwyg-underline"><strong>DOOR OS Change</strong></span></h4>
</td>
</tr>
<tr style="height: 22px;">
<td style="width: 331.562px; height: 22px;">Future Resident to Current Resident</td>
<td style="width: 331.562px; height: 22px;">Resident keys are assigned based on your ePMS assignment.</td>
</tr>
<tr style="height: 22px;">
<td style="width: 331.562px; height: 22px;">Current Resident to Past Resident</td>
<td style="width: 331.562px; height: 22px;">All keys, manually &amp; automatically assigned, are revoked.</td>
</tr>
<tr style="height: 22px;">
<td style="width: 331.562px; height: 22px;">Current Resident to Future Resident</td>
<td style="width: 331.562px; height: 22px;">All keys, manually &amp; automatically assigned, are revoked.</td>
</tr>
</tbody>
</table>
<p> </p>
<p>Related articles: </p>
<p><strong><span class="wysiwyg-underline"><a href="https://support.door.com/hc/en-us/articles/24635368136343-ePMS-FAQs">ePMS FAQs</a></span></strong></p>
