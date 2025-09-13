// Terms and Conditions HTML for Lorry Receipt PDF (2nd page)
// This exports a function returning the HTML for the T&C page, styled for A4 and spacing.

const lorryReceiptTermsHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Terms & Conditions - Owner's Risk</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; margin: 0; padding: 0; }
  .container { max-width: 780px; margin: 10px auto 0 auto; padding: 10px 15px 20px 15px; background: #fff; box-sizing: border-box; }
  h2 { text-align: center; font-size: 18px; margin-top: 30px; margin-bottom: 18px; color: #0d47a1; }
    ol { margin-left: 18px; margin-bottom: 18px; }
    li { margin-bottom: 7px; line-height: 1.5; }
    .footer-row { display: flex; justify-content: space-between; margin-top: 80px; font-size: 13px; }
    .footer-label { font-weight: bold; }
  .marathi { margin-top: 18px; font-size: 13px; color: #b71c1c; text-align: left; }
  .received { margin-top: 10px; font-size: 13px; text-align: left; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Terms & Conditions Carriage Owner's Risk</h2>
    <ol>
      <li>Goods are Booked / Transported entirely at owner's risk.</li>
      <li>We are not responsible for accident fire, theft, strike, heavy raining and rebooking.</li>
      <li>Any alteration of the receipt not accepted unless signed by the booking cleark with his initials.</li>
      <li>Godown delivers of goods must be taken immediately failing which we shall charge wharfage as damurrage Rs. 3/- per day per packet. After expiry of seven days from the date arrival and our responsibility for delivery of goods ceases after 90 days.</li>
      <li>We are not responsible for breakage of glassware and crockery goods as well as leakage, damage and evaporation of all products.</li>
      <li>Transit insurance necessary by the owner of the goods. (Consignor or Consignee)</li>
      <li>No guarantee for weight or contents can be given but all and every of care precaution would be taken on our part against pilferage etc.</li>
      <li>The company is not responsible in the event of goods being detained of sealed or confiscated by Government authorised.</li>
      <li>'To pay Freight' will be paid by party at time of door delivery of goods.</li>
      <li>The conditions are subjects to change without notice.</li>
      <li>Service Tax will be payable by Consignee or Consignor</li>
      <li>Goods will be deliver against Consignee copy with Rubber Stamp</li>
    </ol>
    <div class="marathi">(कंपनी कडील स्वत्तः स्टॅम्प असलेल्या मालाची डिलिव्हरी मिळणार नाही.)</div>
    <div class="received">Received the consignment as per particulars overleaf from Shree Dattaguru Road Lines in good condition.</div>
    <div class="footer-row">
      <div>Date :</div>
      <div class="footer-label">Rubber Stamp</div>
      <div class="footer-label">Consignee's Sign.</div>
    </div>
  </div>
</body>
</html>
`;

export default lorryReceiptTermsHtml;
