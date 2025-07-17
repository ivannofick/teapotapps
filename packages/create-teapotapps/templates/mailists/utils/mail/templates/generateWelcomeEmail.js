export const generateWelcomeEmail = (name = 'teapotapps') => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Sent Successfully</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }
      .wrapper {
        max-width: 600px;
        margin: auto;
        padding: 20px;
      }
      .card {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      h2 {
        color: #2d2d2d;
        margin-top: 0;
      }
      p {
        font-size: 16px;
        color: #444;
        line-height: 1.6;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <h2>📬 Email Delivered Successfully</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>
          Just letting you know — your email has been sent successfully.
        </p>
        <p>
          If you were expecting a response, keep an eye on your inbox. Everything went smoothly on our end.
        </p>
        <p class="footer">
          This is an automated message. No action is needed.
        </p>
      </div>
    </div>
  </body>
</html>
`;
