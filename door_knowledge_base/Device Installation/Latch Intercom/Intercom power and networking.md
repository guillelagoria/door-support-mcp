# Intercom power and networking

**ID:** 24625568032407
**Created:** 2024-07-03T15:02:35Z
**Updated:** 2025-08-08T20:05:34Z
**URL:** https://support.door.com/hc/en-us/articles/24625568032407-Intercom-power-and-networking

---

<h3 id="h_01J1WHSRMA5NBDPV51589NTDSR"><span style="font-weight: 400;">Power requirements</span></h3>
<p><span style="font-weight: 400;">DOOR recommends using a PoE++ switch that supports the 802.3bt standard, which ensures that 50W is available at each port. DOOR </span><strong>does not </strong><span style="font-weight: 400;">recommend directly using PoE switches with less than 50W per port with the intercom. If a PoE switch with less than 50W per port is being used, then PoE should be disabled for the port, or the connection should be moved.</span></p>
<p><span style="font-weight: 400;">Detailed specifications around PoE / connecting the intercom by Ethernet are as follows:</span></p>
<ul>
<ul>
<li style="font-weight: 400;" aria-level="1">
<span style="font-weight: 400;">Ethernet switch that has no PoE ports / Using DC power (2-wire)</span>
<ul>
<li style="font-weight: 400;" aria-level="3"><span style="font-weight: 400;">Amperage is 4A @ 12V or 2A @ 24V</span></li>
</ul>
</li>
<ul>
<li style="font-weight: 400;" aria-level="2">
<span style="font-weight: 400;">DOOR recommends using 24V instead of 12V whenever possible. If the installer is only able to use 12V, they must ensure the wire length and gauge are correct per the chart below</span><span style="font-weight: 400;"><br><br></span><span style="font-weight: 400;"><img src="https://support.door.com/hc/article_attachments/24625552908823" alt="mceclip0.png"></span>
</li>
</ul>
<ul>
<li style="font-weight: 400;" aria-level="2"><span style="font-weight: 400;">The power supply must be a Class 2 Isolated, UL Listed DC Power Supply</span></li>
</ul>
<li style="font-weight: 400;" aria-level="1">
<span style="font-weight: 400;">Ethernet switch with PoE ports</span>
<ul>
<li style="font-weight: 400;" aria-level="3"><span style="font-weight: 400;">The Ethernet switch must be a PoE++ switch that supports the 802.3bt IEEE standard. This will ensure that 50W is available at each port. </span></li>
<ul>
<li style="font-weight: 400;" aria-level="4">
<span style="font-weight: 400;">Example: this </span><span class="wysiwyg-underline"><strong><a href="https://www.netgear.com/business/wired/switches/unmanaged/gs516up/">Netgear GS516UP</a></strong></span><span style="font-weight: 400;"> has eight PoE++ ports</span>
</li>
</ul>
<li style="font-weight: 400;" aria-level="3"><span style="font-weight: 400;">If a PoE switch with less than 50W per port is being used, then PoE should be disabled for the port or the connection should be moved.</span></li>
</ul>
</li>
<ul>
<li style="font-weight: 400;" aria-level="2"><span style="font-weight: 400;">The intercom should NOT be connected to any PoE-enabled port other than a dedicated PoE injector. If connecting to a PoE port, not an injector, see bullets below for detailed specifications. </span></li>
</ul>
<li style="font-weight: 400;" aria-level="1"><span style="font-weight: 400;">Switch with multiple configurations/combination camera + intercom setups</span></li>
<ul>
<li style="font-weight: 400;" aria-level="2"><span style="font-weight: 400;">Using PoE power and 2-wire concurrently</span></li>
</ul>
</ul>
</ul>
<ul>
<li aria-level="3"><span class="wysiwyg-underline"><strong>Do not use PoE and 2-wire concurrently</strong></span></li>
</ul>
<ul>
<ul>
<li style="font-weight: 400;" aria-level="2"><span style="font-weight: 400;">Switch that has some PoE ports and some non-PoE ports</span></li>
<ul>
<li style="font-weight: 400;" aria-level="3"><span style="font-weight: 400;">A camera and an intercom could be connected to the same PoE switch but with each port configured with different settings. For example, a camera could be connected to a switch port with 802.3at power (&lt;50W available) with the intercom on a port that satisfies the 50W power requirement</span></li>
</ul>
<li style="font-weight: 400;" aria-level="2"><span style="font-weight: 400;">Switch that has different types of PoE ports (some PoE+ ports and some PoE++ ports)</span></li>
<ul>
<li style="font-weight: 400;" aria-level="3"><span style="font-weight: 400;">Camera could be connected to a switch port with 802.3at power (&lt;50W available) with the intercom on a 802.3bt power (&gt;50W available) PoE++ port </span></li>
</ul>
<li style="font-weight: 400;" aria-level="2"><span style="font-weight: 400;">Switch that has all PoE ports but has SW control to disable PoE per port</span></li>
<ul>
<li style="font-weight: 400;" aria-level="3"><span style="font-weight: 400;">Very important for the installer to disable PoE for the Intercom’s port to ensure they don’t end up with an under-rated PoE source</span></li>
</ul>
</ul>
</ul>
<h3 id="h_01J1WHSRMA1KFPZASEZGMRNN04"><span style="font-weight: 400;">Network Requirements</span></h3>
<p><span style="font-weight: 400;">The network must provide at least 2Mbps download and upload speeds for the intercom to function properly. The intercom can connect to a WPA or WPA2 WiFi network. Currently, the intercom does not support connecting to hidden WiFi networks or WiFi networks that provide network access only after accepting terms &amp; conditions via a browser (like how guests get access to WiFi networks in hotels or airports). </span></p>
<p> </p>
