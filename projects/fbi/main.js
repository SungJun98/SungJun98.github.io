(function () {
  'use strict';

  var button = document.getElementById('copy-citation');
  var citation = document.getElementById('bibtex');
  var status = document.getElementById('copy-status');

  document.querySelectorAll('.math-display, .math-inline').forEach(function (element) {
    katex.render(element.textContent, element, {
      displayMode: element.classList.contains('math-display')
    });
  });

  var chart = document.getElementById('resource-chart');
  var template = document.getElementById('resource-bar-template');
  document.querySelectorAll('#training-resources tbody tr').forEach(function (row) {
    var cells = row.querySelectorAll('td');
    var fbi = cells[0].textContent.trim();
    var direct = cells[1].textContent.trim();
    var share = 100 * Number(fbi) / Number(direct);
    var bars = template.content.cloneNode(true);
    bars.querySelector('h4').innerHTML = row.querySelector('th').innerHTML;
    bars.querySelector('.resource-value-fbi').textContent = fbi;
    bars.querySelector('.resource-value-direct').textContent = direct;
    bars.querySelector('.resource-share').textContent = share.toFixed(1) + '% of Direct-10';
    bars.querySelector('.resource-fill-fbi').style.width = share + '%';
    chart.appendChild(bars);
  });

  button.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(citation.textContent);
      status.textContent = 'Citation copied to clipboard.';
    } catch (error) {
      status.textContent = 'Copy failed. Select the citation above and copy it manually.';
      citation.parentElement.focus();
    }
  });
})();
