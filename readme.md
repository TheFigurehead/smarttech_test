<h1>ThreadHub SOP - Backend Dev task</h1>
<h2>Author: Oleksii Shkapenko</h2>

<h3>Task description</h3>
<p>A file containing a list of Vulnerabilities, where each vulnerability has a unique ID, a name, and a list of platform relations, each
consisting of a platform ID, a minimum version, and a maximum version.</p>
<p>A file containing a list of Assets, where each asset has a unique ID, a name, and a list of platform relations, each consisting of a platform
ID, a minimum version, and a maximum version.</p>
<p>A file containing a list of Platforms, where each platform has a unique ID and a name.</p>


<h3>Requirements checklist:</h3>
<ul>
<li>[x] Write a function that takes the input data as arguments and returns the list of Asset-Vulnerability pairs.</li>
<li>[x] The function should handle edge cases such as empty input files or missing platform IDs.</li>
<li>[x] The function should have a time complexity of O(n^2) or better.</li>
<li>[x] The script should read the input data from the JSON files and write the output to a JSON file named "output.json".</li>
<li>[x] The script should be able to handle very large input data (e.g., millions of assets and vulnerabilities).</li>
</ul>

<h3>Bonus Points:</h3>
<ul>
<li>[x] Use TypeScript to write the code.</li>
<li>[x] Use asynchronous I/O to read and write the input and output files.</li>
<li>[not sure] Implement a parallel algorithm to speed up the processing of the input data.</li>
<li>[partially] Implement input validation and error handling.</li>
<li>[partially] Write tests to validate the correctness of the function.</li>
<li>[tried] In a perfect world, platform versions use Semantic Versioning but in real life, the versions are not semantic. Do you beset to
cover cases where the version is non-semantic format (ex: 1.0-alpha )</li>
</ul>

<h3>Problems statement/Proposed solution:</h3>
<p> As the files might be extremelly big, I decided not to keep input and output files in memory. For that partial JSON decoding was implemented. But, of course, it damaged the ability to speed up the processing of the input data by parallel algorithm.</p>
<ul>
<li> As the files might be extremelly big, I decided not to use synchronous I/O to read and write the input and output files. For that asynchronous I/O was implemented.</li>
<li> As the files might be extremelly big, I decided not to use JSON.parse() to decode JSON files. For that partial JSON decoding was implemented.</li>
<li> As files, again, might be big I've added random generation of input files. It is possible to generate files with 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000 records. </li>
</ul>

<h3>How to run:</h3>
<b>Please, use node.js version 20, as this one includes native node:test library which was used for writing tests.</b>
<b>Project doesn't require any external library.</b>
<p>There are 3 commands to run:</p>
<ul>
<li>
npm run generate - generates input files with random data.
use "npm run generate -- --assets=123 --vulnerabilities=321" to control the size of rendered inputs (by default 100 for each).
</li>
<li>
npm run start - runs the script.
Progress is shown in the console.
</li>
<li>
npm run test - runs tests.
</li>
</ul>

<h3>Structure overview:</h3>
<ul>
<li>
index.ts - entry point of the script.
</li>
<li>
src/MainProcess.ts - main process of the script.
This class opens read stream of assets and write stream of output file.
</li>
<li>
src/SecondaryProcess.ts - classes is used inside MainProcess for each chunk of asset read stream.
Compare all vulnarabilities with current asset and write to output file if match found.
</li>
<li>
src/PartialJSONDecoder.ts - class is used to decode JSON files partially.
</li>
<li>
dummy.ts - calls for generation methods.
</li>
<li>
src/placeholders.ts - contains all methods for random generation.
</li>
<li>
src/types.ts - contains all types: Asset, Vulnerability, Platform, Pair.
</li>
<li>
src/utils.ts - contains all utility methods.
</li>
<li>
src/semantic.ts - contains all method for generating and comparing versions.
</li>
</ul>

<h3>Perfomance: </h3>
<p> I've run the number of tests to check the perfomance of the script.</p>
<p> Different size of inputs (therefore different possible output size) were tested.</p>
<p>Result are presented on the graph below:</p>
<a href="https://imgbb.com/"><img src="https://i.ibb.co/Vj1rxX3/screenshot-docs-google-com-2023-07-30-15-03-43.png" alt="screenshot-docs-google-com-2023-07-30-15-03-43" border="0"></a><br />

There is a google spreasheet with the results, have a look:
https://docs.google.com/spreadsheets/d/1bzL6P8Xs05C0l-L0glTC1y0e_pnzxA8ZEj5KowyZbdk/edit?usp=sharing