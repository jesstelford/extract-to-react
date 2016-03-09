import React from 'react';

export default function AdvancedUsage() {
  return (
    <section id='advanced-usage'>
      <h2>Advanced Usage</h2>
      <h3>Extracting multiple nested components</h3>
      <p>Ordinarily, only a single component is extracted. It is possible to split this monolithic component up into multiple nested components:</p>
      <ul>
        <li>Find the elements you wish to become their own component in the "Elements" tab</li>
        <li>Add an attribute called <code>data-component</code>.</li>
        <li>Set the value of <code>data-component</code> to be the name of the component.</li>
      </ul>
      <p>For example:</p>
      <pre><code>
    &#x3C;h1 class=&#x22;heading&#x22; data-component=&#x22;Heading&#x22;&#x3E;Hello, world!&#x3C;/h1&#x3E;

    &#x3C;nav class=&#x22;nav&#x22; data-component=&#x22;Nav&#x22;&#x3E;
      &#x3C;ul class=&#x22;list&#x22;&#x3E;
        &#x3C;li class=&#x22;list-item&#x22; data-component=&#x22;ListItem&#x22;&#x3E;#1&#x3C;/li&#x3E;
        &#x3C;li class=&#x22;list-item&#x22; data-component=&#x22;ListItem&#x22;&#x3E;#2&#x3C;/li&#x3E;
      &#x3C;/ul&#x3E;
    &#x3C;/nav&#x3E;
      </code></pre>
      <p>Will result in 3 components being extracted: <code>Heading</code>, <code>Nav</code>, and <code>ListItem</code>
      </p>
    </section>
  );
}
