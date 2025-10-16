# Latch R - Elevator Floor Access (EFA)

**ID:** 24634148409623
**Created:** 2024-07-03T18:56:29Z
**Updated:** 2025-08-11T13:53:37Z
**URL:** https://support.door.com/hc/en-us/articles/24634148409623-Latch-R-Elevator-Floor-Access-EFA

---

<h3 id="h_01J1WYXDY74W7XSSVRGWYW9JCA">Before integrating an EFA system, please reach out to DOOR Support for assistance at <a href="mailto:support@door.com"><span class="wysiwyg-underline">support@door.com</span></a>.</h3>
<p>Elevator Floor Access (EFA) allows a credential to be required to reach certain floors, increasing security. </p>
<h3 id="h_01J1WYXDY7QEYBW1DBJX352SCR">Requirements</h3>
<ul>
<li>Floor Group Table: The Property Manager must work with DOOR to set up floor access ahead of installation. DOOR will then generate a Floor Group Table to be programmed into the access control panel being used for elevators. This will be displayed in the DOOR App after the R is activated.</li>
<li>Third-party access controller: <strong>The panel must be able to receive a 26-bit Wiegand credential.</strong> If the property requires scheduling or floors to be unlocked during certain hours, this needs to be supported by the access controller. <strong>The installer must be comfortable working with the access controller, and it must be on DOOR's approved list.</strong> For installers wishing to use access controllers not on this list, DOOR will minimally support the installation/configuration of the panel.
<ul>
<li>See the “<strong><span class="wysiwyg-underline"><a href="https://docs.google.com/document/d/1c-DrKE-fHJEc83ucHiS1e8DOQQJVtkkrOpJjg5buQJI/edit?usp=sharing"><span style="color: #1155cc;">Weigand Troubleshooting</span></a></span></strong>” section for additional information.</li>
</ul>
</li>
<li>Internet: Internet must be provided to the Rs. If an R is installed inside a cab, access to the internet must be provided via Ethernet through transceivers with a coax cable running in the traveling cable. </li>
</ul>
<h3 id="h_01J1WYXDY72WK8F8T3WQ8778XV">Wiring Requirements</h3>
<p><span class="wysiwyg-underline"><img style="height: 507px; width: 624px;" src="https://support.door.com/hc/article_attachments/24634085354903"></span></p>
<h3 id="h_01J1WYXDY7HMFBJZE3H27A5BB1">Programming the Latch R </h3>
<ul>
<li>Activating the Latch R
<ul>
<li>During the activation process, make sure to select FW Version 5.1x.xx</li>
</ul>
</li>
<li>Configuration
<ul>
<li>Internet is mandatory for all EFA installations.</li>
<li>Go to the Device Detail page after the activation process.</li>
<li>Go to the Settings page.</li>
<li>Configure Ethernet or WiFi.</li>
<li>Save changes</li>
</ul>
</li>
</ul>
<h3 id="h_01J1WYXDY79GM2QY9735Q95DMK">Programming the Access Panel</h3>
<ul>
<li>Floor Groups that mirror the system's Cloud must be created in the panel. Refer to the Floor Lookup Table on the Device Detail page in the Door App.</li>
<li>The Floor Lookup Table contains the following:
<ul>
<li>Floor Group Name: This corresponds with the User Name field in most panels.</li>
<li>Facility Code and ID Code: Put together, this is the Wiegand code.</li>
<li>Floors: The floors that belong to this Floor Group.</li>
</ul>
</li>
</ul>
<p>Testing EFA</p>
<ol>
<li>Prior to the day of installation, the Property Manager must create an account for each Floor Group, assign each account a different Floor Group, and give access to each of the accounts to the Integrator.</li>
<li>Before presenting a credential, test the elevator by making sure that all of the necessary floors are locked.</li>
<li>Present the credential for the first Floor Group.
<ol>
<li>Confirm that all of the necessary floors are unlocked. </li>
<li>Example: If the first Floor Group has access to floors 2 and 3, verify that floors 2 and 3 are unlocked.</li>
</ol>
</li>
<li>Continue this process for each Floor Group, including the Daily Doorcode Floor Group.</li>
<li>After testing is complete, the Property Manager should delete each of the accounts created for testing.</li>
</ol>
