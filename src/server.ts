import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // filteredimage Endpoint
  app.get('/filteredimage', async (req: Request, res: Response) => {
    // 1. validate the image_url query
    try {
      const { image_url } = req.query;
      const imagePaths: string[] = [];
      // 1. validate the image_url query ( validate in filterImageFromURL method)
      // 2. call filterImageFromURL(image_url) to filter the image
      await filterImageFromURL(image_url.toString()).then(
        (imagePath: string) => {
          // 3. send the resulting file in the response
          res.status(200).sendFile(imagePath);
          imagePaths.push(imagePath);
        },
      );
      // 4. deletes any files on the server on finish of the response
      res.on('finish', () => {
        deleteLocalFiles(imagePaths);
      });
    } catch (error) {
      // return error message if have any issue
      res.status(400).json({
        // @ts-ignore
        code: error.code,
        // @ts-ignore
        error: error.message + ", Please check again image's url",
      });
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get('/', async (req, res) => {
    res.send('try GET /filteredimage?image_url={{}}');
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
