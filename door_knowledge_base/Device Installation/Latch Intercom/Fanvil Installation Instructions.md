# Fanvil Installation Instructions

**ID:** 24626480351255
**Created:** 2024-07-03T15:24:31Z
**Updated:** 2025-08-08T20:31:17Z
**URL:** https://support.door.com/hc/en-us/articles/24626480351255-Fanvil-Installation-Instructions

---

<h2 id="h_01J1WK1WRQ60273XWX6A6Y7DWE">
<span style="font-weight: 400;">Fanvil i10D </span><span style="font-weight: 400;">Configuration</span>
</h2>
<h3 id="h_01J1WK1WRQHVQER96MCYFXS1NR"><span style="font-weight: 400;">Setup </span></h3>
<ol>
<li>
<span style="font-weight: 400;"> Please work with your Internet Service Provider to obtain a </span><strong>Static IP </strong><span style="font-weight: 400;">and configure your Property’s Network to use </span><strong>Static IP</strong><span style="font-weight: 400;">. All Fanvil extensions must be connected to a network using </span><strong>Static IP</strong><span style="font-weight: 400;">. Please communicate this IP with DOOR Support (<a href="mailto:support@door.com">support@door.com</a>) prior to proceeding to Step 2.</span>
</li>
<li><span style="font-weight: 400;"> Connect the Fanvil to DOOR’s PBX Server.</span></li>
<li><span style="font-weight: 400;"> Unscrew the Fanvil top.</span></li>
<li><span style="font-weight: 400;"> Connect the Fanvil to power and ethernet.</span></li>
<li><span style="font-weight: 400;"> Rescrew the Fanvil top / Mount the device.</span></li>
<li><span style="font-weight: 400;"> Press and hold the Call button on the Fanvil for approx 5 seconds.</span></li>
<li><span style="font-weight: 400;"> Once a noise starts playing tap the Call button again.</span></li>
<li><span style="font-weight: 400;"> The Fanvil will say its IP address.</span></li>
<li><span style="font-weight: 400;"> While on the same network as Fanvil, type the IP address into your laptop's browser 8. Login with username and password both as “admin."</span></li>
<li><span style="font-weight: 400;"> Now go to the Line section from the left menu and input the information generated when you created the Extension in the FreePBX Console. The extension number is the username and the secret is the password. The Server Address is 38.39.190.43 and Server Port is 5060. The expected transport protocol is UDP. Click Apply. </span></li>
<li><span style="font-weight: 400;"> If all of the information was correctly entered, then you should see the Line Status become Registered after refreshing. </span></li>
<li><span style="font-weight: 400;"> Go to Basic Settings and make sure Auto-Answering is OFF.</span></li>
<li><span style="font-weight: 400;"> Go to the Function Key section in the left menu. Under Function Key Settings create a DSS Key that is of type DTMF, name it Unlock DTMF, set the value to 9, then click Apply. </span></li>
<li><span style="font-weight: 400;"> Under Programmable Key Settings, set Key 2 to the DSS Key you just created (named Unlock DTMF) in the Desktop and Talking Column. Click Apply. </span></li>
<li><span style="font-weight: 400;"> Ask DOOR Support to assign this Fanvil's PBX Extension or SIP URI to the Unit. Alternatively, this can be done in the DOOR App if you have the right permissions. </span></li>
<li>
<span style="font-weight: 400;"> Go into DOOR OS and link the SIP URI to the desired unit. The SIP URI should be “</span>sip:&lt;EXTENSION&gt;@38.39.190.43”. This is often referred to as the Indoor Intercom Number in our system.</li>
</ol>
<p><span style="font-weight: 400;">This can also be done in bulk via a CSV import.</span></p>
