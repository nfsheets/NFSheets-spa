// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./Base64.sol";

/**
 * @dev Pure functions used as utilities in the main `NFSheets` contract.
 */
contract NFSheetsUtils {
    // A - Z
    uint256 public constant NUM_COLUMNS = 26;
    uint256 public constant NUM_ROWS = 1000;

    /**
     * Converts a cell ID to a token ID
     *
     * Example: A1    = column 1, row 1    => ID 1
     *          A2    = column 1, row 2    => ID 2
     *          A1000 = column 1, row 1000 => ID 1000
     *          B1    = column 2, row 1    => ID 1001
     *          (assuming 1000 rows per column)
     */
    function cellIdToTokenId(
        uint256 column,
        uint256 row
    ) external pure returns (uint256) {
        // Subtract 1 from `column` and `row` since they are zero-indexed,
        // then add 1 to start IDs from 1.
        return NUM_ROWS * (column - 1) + (row - 1) + 1;
    }

    /**
     * Converts a token ID to a cell ID (reverse of `cellIdToTokenId`).
     */
    function tokenIdToCellId(
        uint256 tokenId
    ) external pure returns (string memory) {
        string[26] memory letters = [
            "A", "B", "C", "D", "E",
            "F", "G", "H", "I", "J",
            "K", "L", "M", "N", "O",
            "P", "Q", "R", "S", "T",
            "U", "V", "W", "X", "Y",
            "Z"
        ];
        uint256 row = (tokenId - 1) % NUM_ROWS + 1;
        uint256 column = (tokenId - 1) / NUM_ROWS + 1;

        string memory output = string(
            abi.encodePacked(
                letters[column - 1],
                Strings.toString(row)
            )
        );
        return output;
    }

    /**
     * @dev Escape HTML characters to prevent XSS:
     * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
     *
     * Based on
     * https://stackoverflow.com/questions/70404338/how-to-escape-html-special-characters-in-solidity
     */
    function escapeHTML(string memory input)
    public
    pure
    returns (string memory)
{
    bytes memory inputBytes = bytes(input);
    uint extraCharsNeeded = 0;
    
    for (uint i = 0; i < inputBytes.length; i++) {
        bytes1 currentByte = inputBytes[i];
        
        if (currentByte == "&") {
            extraCharsNeeded += 5;
        } else if (currentByte == "<") {
            extraCharsNeeded += 5;
        } else if (currentByte == ">") {
            extraCharsNeeded += 5;
        } else if (currentByte == "\"") {
            extraCharsNeeded += 5;
        } else if (currentByte == "'") {
            extraCharsNeeded += 5;
        }
    }
    
    if (extraCharsNeeded > 0) {
        bytes memory escapedBytes = new bytes(
            inputBytes.length + extraCharsNeeded
        );
        
        uint256 index;
        
        for (uint i = 0; i < inputBytes.length; i++) {
            // Use hex codes rather than &amp;, etc since
            // the names aren't defined in SVG.
            if (inputBytes[i] == "&") {
                escapedBytes[index++] = "&";
                escapedBytes[index++] = "#";
                escapedBytes[index++] = "x";
                escapedBytes[index++] = "2";
                escapedBytes[index++] = "6";
                escapedBytes[index++] = ";";
            } else if (inputBytes[i] == "<") {
                escapedBytes[index++] = "&";
                escapedBytes[index++] = "#";
                escapedBytes[index++] = "x";
                escapedBytes[index++] = "3";
                escapedBytes[index++] = "c";
                escapedBytes[index++] = ";";
            } else if (inputBytes[i] == ">") {
                escapedBytes[index++] = "&";
                escapedBytes[index++] = "#";
                escapedBytes[index++] = "x";
                escapedBytes[index++] = "3";
                escapedBytes[index++] = "e";
                escapedBytes[index++] = ";";
            } else if (inputBytes[i] == "\"") {
                escapedBytes[index++] = "&";
                escapedBytes[index++] = "#";
                escapedBytes[index++] = "x";
                escapedBytes[index++] = "2";
                escapedBytes[index++] = "2";
                escapedBytes[index++] = ";";
            } else if (inputBytes[i] == "'") {
                escapedBytes[index++] = "&";
                escapedBytes[index++] = "#";
                escapedBytes[index++] = "x";
                escapedBytes[index++] = "2";
                escapedBytes[index++] = "7";
                escapedBytes[index++] = ";";
            } else {
                escapedBytes[index++] = inputBytes[i];
            }
        }
        return string(escapedBytes);
    }
    
    return input;
}

    /**
     * @dev Generates a spreadsheet cell SVG according to the passed
     * parameters.
     */
    function tokenSvg(
        string memory value
    ) external pure returns (string memory) {
        string[3] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 132.5 128"><defs><style>.cls-1{fill:none;}.cls-2{fill:#fefefe;}.cls-3{fill:#e1e2e2;}.cls-4{fill:#3573df;}.cls-5{clip-path:url(#clip-path);}.cls-6{font-size:12px;font-family:ArialMT, Arial;}</style><clipPath id="clip-path" transform="translate(0.86 3.64)"><rect class="cls-1" x="11.13" y="51.38" width="98.96" height="19.97"/></clipPath></defs><g id="Layer_1" data-name="Layer 1"><path class="cls-2" d="M124.11,51.36v20h-9.92c.44-2.72-.93-3.43-3.32-3-.9.17-2.34-.55-2.61.56a10.54,10.54,0,0,0,0,4.87c.31,1.2,1.89.27,2.84.64,0,5.16-.06,10.32.05,15.48,0,1.78-.36,2.47-2.33,2.47q-47.67-.09-95.36,0c-2,0-2.35-.7-2.32-2.47.09-5.83,0-11.65,0-17.48,1,0,2-.07,3-.07h89.43a9.25,9.25,0,0,0,1.49,0c.76-.14,2.07.58,2-1s-1.35-.75-2.1-.92a7.5,7.5,0,0,0-1.5,0H44.28c-9.91,0-19.82-.06-29.73.06-2,0-2.48-.61-2.42-2.51.13-4.49.11-9,0-13.49,0-1.62.43-2.08,2.07-2.08q47,.08,93.93,0c1.73,0,2.06.6,2,2.14-.09,3.67,0,7.33,0,11,0,.7-.52,1.82.89,1.88,1.63.06,1-1.21,1.06-2,.07-4.66.08-9.32.1-14Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M11.17-3.61h99.94c0,3.08-.13,6.16,0,9.23.12,2.16-.49,2.83-2.75,2.82-16.21-.1-32.43,0-48.64,0-15.3,0-30.6-.05-45.9,0-2.25,0-2.87-.65-2.74-2.82C11.3,2.55,11.17-.53,11.17-3.61Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M111.11,124.32H11.17c0-2.33.16-4.67,0-7s.56-3.07,3-3.07q47,.14,94,.06c.42,0,.84,0,1.25,0,1.32-.13,1.74.5,1.72,1.76C111.07,118.83,111.11,121.58,111.11,124.32Z" transform="translate(0.86 3.64)"/><path class="cls-3" d="M11.17-3.61c0,3.08.13,6.16,0,9.23-.13,2.17.49,2.84,2.74,2.82,15.3-.1,30.6,0,45.9,0,16.21,0,32.43-.05,48.64,0,2.26,0,2.87-.66,2.75-2.82-.18-3.07,0-6.15,0-9.23h1c0,3.39,0,6.77,0,10.15,0,1.39.48,1.9,1.87,1.87,3.38-.07,6.76,0,10.15,0v1c-3.32,0-6.64,0-10,0-1.44,0-2.1.34-2.08,1.94q.12,8.09,0,16.16c0,1.6.64,2,2.08,1.94,3.31-.07,6.63,0,10,0v1c-3.33,0-6.66.05-10,0-1.48,0-2.07.41-2,2,.09,6,.07,12,.1,18l-.13.14-1-.14c0-5.82,0-11.65.05-17.47,0-1.78-.36-2.48-2.32-2.48q-47.68.09-95.37,0c-2,0-2.35.7-2.32,2.48.09,5.82,0,11.65,0,17.47l-1,.14-.13-.14c0-6,0-12,.11-18,0-1.56-.56-2-2-2-3,.08-6,0-9,0v-1c3,0,6-.06,9,0,1.44,0,2.09-.35,2.07-1.94q-.12-8.07,0-16.16c0-1.59-.63-2-2.07-1.94-3,.08-6,0-9,0v-1c3.05,0,6.1-.05,9.15,0,1.4,0,1.89-.49,1.86-1.87-.06-3.38,0-6.77,0-10.15Zm49.72,33c15.9,0,31.8,0,47.69,0,1.9,0,2.64-.41,2.58-2.47-.15-5.08-.1-10.16,0-15.23,0-1.64-.33-2.36-2.18-2.36q-47.82.08-95.63,0c-1.85,0-2.21.71-2.19,2.35.08,5,.15,10,0,15C11,29,11.81,29.43,14,29.42,29.59,29.34,45.24,29.38,60.89,29.38Z" transform="translate(0.86 3.64)"/><path class="cls-3" d="M111.11,124.32c0-2.74,0-5.49,0-8.23,0-1.26-.4-1.89-1.72-1.76-.41,0-.83,0-1.25,0q-47,0-94-.06c-2.43,0-3.2.69-3,3.07s0,4.65,0,7h-1c0-2.72-.05-5.44,0-8.15,0-1.4-.48-1.89-1.87-1.86-3,.07-6.09,0-9.14,0v-1c3,0,6,0,9,0,1.44,0,2.09-.34,2.07-1.93q-.12-8.08,0-16.17c0-1.59-.63-2-2.07-1.93-3,.07-6,0-9,0v-1c3,0,6-.06,9,0,1.48,0,2.06-.41,2-2-.1-6-.08-12-.11-18l.13-.14,1,.13c0,5.83,0,11.65,0,17.48,0,1.77.35,2.48,2.32,2.47q47.69-.09,95.36,0c2,0,2.36-.69,2.33-2.47-.11-5.16-.05-10.32-.05-15.48h1c0,5.16.08,10.31-.06,15.46-.06,2,.64,2.57,2.56,2.49,3.15-.14,6.32,0,9.48,0v1c-3.32,0-6.64,0-10,0-1.44,0-2.1.34-2.08,1.93q.12,8.09,0,16.17c0,1.59.64,2,2.08,1.93,3.31-.07,6.63,0,10,0v1c-3.38,0-6.76,0-10.14,0-1.38,0-1.92.45-1.88,1.85.08,2.72,0,5.44,0,8.16ZM61,113.33c15.9,0,31.8,0,47.69,0,1.79,0,2.51-.38,2.47-2.33-.13-5.16-.11-10.33,0-15.48,0-1.79-.6-2.24-2.3-2.24q-47.7.06-95.39,0c-2,0-2.36.69-2.32,2.47.1,5,.13,10,0,15-.06,2.12.65,2.63,2.69,2.62C29.54,113.29,45.27,113.33,61,113.33Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M124.11,29.38c-3.32,0-6.64-.05-10,0-1.44,0-2.1-.34-2.08-1.94q.12-8.07,0-16.16c0-1.6.64-2,2.08-1.94,3.31.08,6.63,0,10,0Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M112.19,50.28c0-6,0-12-.1-18,0-1.57.56-2,2-2,3.32.08,6.65,0,10,0v20Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M124.11,113.33c-3.32,0-6.64,0-10,0-1.44,0-2.1-.34-2.08-1.93q.12-8.08,0-16.17c0-1.59.64-2,2.08-1.93,3.31.07,6.63,0,10,0Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M124.11,92.34c-3.16,0-6.33-.1-9.48,0-1.92.08-2.62-.44-2.56-2.49.14-5.15.05-10.3.06-15.46,1.55.18,2.24-.51,2.06-2.06l9.92,0Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M-.82,9.39c3,0,6,0,9,0,1.44,0,2.09.35,2.07,1.94q-.12,8.09,0,16.16c0,1.59-.63,2-2.07,1.94-3-.08-6,0-9,0Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M-.82,30.38c3,0,6,.05,9,0,1.48,0,2.06.42,2,2-.1,6-.08,12-.11,18l-10.91.08Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M-.82,71.35v-20l10.91,0v20Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M10.09,72.44c0,6,0,12,.11,18,0,1.56-.56,2-2,2-3-.08-6,0-9,0v-20Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M-.82,93.34c3,0,6,0,9,0,1.44,0,2.09.34,2.07,1.93q-.12,8.09,0,16.17c0,1.59-.63,2-2.07,1.93-3-.07-6,0-9,0Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M124.11,8.39c-3.39,0-6.77-.05-10.15,0-1.39,0-1.9-.48-1.87-1.87.07-3.38,0-6.76,0-10.15,3.63,0,7.26,0,10.88,0,.93,0,1.16.21,1.14,1.14C124.07,1.13,124.11,4.76,124.11,8.39Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M10.17-3.61c0,3.38,0,6.77,0,10.15,0,1.38-.46,1.9-1.86,1.87-3-.07-6.1,0-9.15,0,0-3.58,0-7.17,0-10.75,0-1.07.21-1.31,1.29-1.28C3.67-3.55,6.92-3.61,10.17-3.61Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M112.11,124.32c0-2.72.06-5.44,0-8.16,0-1.4.5-1.88,1.88-1.85,3.38.06,6.76,0,10.14,0,0,2.91-.07,5.83,0,8.74,0,1.08-.21,1.31-1.28,1.29C119.28,124.27,115.69,124.32,112.11,124.32Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M-.82,114.33c3.05,0,6.1,0,9.14,0,1.39,0,1.91.46,1.87,1.86-.07,2.71,0,5.43,0,8.15-3.25,0-6.5-.06-9.74,0-1.08,0-1.32-.21-1.29-1.29C-.76,120.16-.82,117.24-.82,114.33Z" transform="translate(0.86 3.64)"/><path class="cls-3" d="M112.19,50.28l11.92.08v1l-11.92,0-.13-1Z" transform="translate(0.86 3.64)"/><path class="cls-3" d="M10.09,51.38l-10.91,0v-1l10.91-.08.13.14Z" transform="translate(0.86 3.64)"/><path class="cls-3" d="M10.09,72.44-.82,72.35v-1H10.09l.13,1Z" transform="translate(0.86 3.64)"/><path class="cls-3" d="M124.11,72.35l-9.92,0v-1h9.92Z" transform="translate(0.86 3.64)"/><path class="cls-4" d="M10.22,72.3l-.13-1v-20l.13-1,1-.14c1,0,2,.08,3,.08h86.43c3.5,0,7,0,10.49-.08l1,.14.13,1c0,4.66,0,9.32-.1,14,0,.76.57,2-1.06,2-1.41-.06-.88-1.18-.89-1.88,0-3.66-.09-7.32,0-11,0-1.54-.28-2.14-2-2.14q-47,.09-93.93,0c-1.64,0-2.1.46-2.07,2.08.11,4.5.13,9,0,13.49-.06,1.9.39,2.53,2.42,2.51,9.91-.12,19.82-.06,29.73-.06h59.2a7.5,7.5,0,0,1,1.5,0c.75.17,2-.65,2.1.92s-1.22.91-2,1a9.25,9.25,0,0,1-1.49,0H14.18c-1,0-2,0-3,.07Z" transform="translate(0.86 3.64)"/><path class="cls-4" d="M114.19,71.34v1c.18,1.55-.51,2.24-2.06,2.06h-1c-.95-.37-2.53.56-2.84-.64a10.54,10.54,0,0,1,0-4.87c.27-1.11,1.71-.39,2.61-.56C113.26,67.91,114.63,68.62,114.19,71.34Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M60.89,29.38c-15.65,0-31.3,0-46.94,0-2.14,0-2.92-.46-2.83-2.74.17-5,.1-10,0-15,0-1.64.34-2.35,2.19-2.35q47.81.08,95.63,0c1.85,0,2.21.72,2.18,2.36-.08,5.07-.13,10.15,0,15.23.06,2.06-.68,2.48-2.58,2.47C92.69,29.35,76.79,29.38,60.89,29.38Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M111.1,50.28c-3.5,0-7,.08-10.49.08H14.18c-1,0-2,0-3-.08,0-5.82,0-11.65,0-17.47,0-1.78.36-2.48,2.32-2.48q47.69.09,95.37,0c2,0,2.35.7,2.32,2.48C111.05,38.63,111.1,44.46,111.1,50.28Z" transform="translate(0.86 3.64)"/><path class="cls-2" d="M61,113.33c-15.73,0-31.46,0-47.19,0-2,0-2.75-.5-2.69-2.62.15-5,.12-10,0-15,0-1.78.37-2.47,2.32-2.47q47.7.09,95.39,0c1.7,0,2.34.45,2.3,2.24-.1,5.15-.12,10.32,0,15.48,0,2-.68,2.34-2.47,2.33C92.8,113.3,76.9,113.33,61,113.33Z" transform="translate(0.86 3.64)"/></g><g id="Layer_2" data-name="Layer 2"><g class="cls-5"><text class="cls-6" transform="translate(16.98 69.75) scale(1.01 1)">';
        parts[1] = escapeHTML(value);
        parts[2] = '</text></g></g></svg>';

        string memory output = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2]
            )
        );

        return output;
    }
}

/**
 * Main NFSheets contract.
 */
contract NFSheets is
    ERC721,
    ERC721Enumerable,
    ReentrancyGuard,
    Ownable
{
    struct Cell {
        string value;
        mapping(string => string) attributes;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(msg.sender == super.ownerOf(tokenId));
        _;
    }

    NFSheetsUtils nfsheetsUtils;

    /**
     * @dev The current price of minting/buying a cell. Can be updated by
     * contract owner via `setPrice`.
     */
    uint256 private price = 0.001 ether;

    string private description =
        "We're creating a spreadsheet collaboratively on the blockchain.";

    /**
     * @dev Mapping of token IDs to cell metadata
     */
    mapping(uint256 => Cell) private spreadsheet;

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory value = getValue(tokenId);
        string memory output = nfsheetsUtils.tokenSvg(value);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Cell ',
                        nfsheetsUtils.tokenIdToCellId(tokenId),
                        '", "description": "',
                        description,
                        '", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        '"}'
                    )
                )
            )
        );
        output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function mint(uint256 column, uint256 row) public payable nonReentrant {
        require(msg.value >= price, "Not enough value sent; check price!");
        require(
            column >= 1 && column <= nfsheetsUtils.NUM_COLUMNS(),
            "Column must be between 1 and NUM_COLUMNS"
        );
        require(
            row >= 1 && row <= nfsheetsUtils.NUM_ROWS(),
            "Row must be between 1 and NUM_ROWS"
        );

        uint256 tokenId = nfsheetsUtils.cellIdToTokenId(column, row);

        _safeMint(_msgSender(), tokenId);
    }

    /**
     * @dev Gets the cell value for a given token id.
     */
    function getValue(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return spreadsheet[tokenId].value;
    }

    /**
     * @dev Sets the cell value for a given token id.
     */
    function setValue(uint256 tokenId, string memory value)
        public
        onlyTokenOwner(tokenId)
    {
        spreadsheet[tokenId].value = value;
    }

    /**
     * @dev Gets a cell attribute for a given token id.
     */
    function getAttribute(uint256 tokenId, string memory key)
        public
        view
        returns (string memory)
    {
        return spreadsheet[tokenId].attributes[key];
    }

    /**
     * @dev Sets a cell attribute for a given token id.
     */
    function setAttribute(
        uint256 tokenId,
        string memory key,
        string memory value
    ) public onlyTokenOwner(tokenId) {
        spreadsheet[tokenId].attributes[key] = value;
    }

    /**
     * @dev Gets the current price.
     */
    function getPrice() public view returns (uint256) {
        return price;
    }

    /**
     * @dev Allows the contract owner to change the mint price.
     */
    function setPrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
    }

    /**
     * Allows the contract owner to upgrade the NFSheetsUtils contract
     * (e.g. to add support for new attributes)
     */
    function setNfsheetsUtilsAddress(
        address nfsheetsUtilsAddress
    ) public onlyOwner {
        nfsheetsUtils = NFSheetsUtils(nfsheetsUtilsAddress);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Allows the owner to withdraw ether than has been sent to the
     * contract.
     */
    function withdraw() public onlyOwner {
        Address.sendValue(payable(msg.sender), address(this).balance);
    }

    constructor(address nfsheetsUtilsAddress)
        ERC721("NFSheets", "XLS")
        Ownable()
    {
        nfsheetsUtils = NFSheetsUtils(nfsheetsUtilsAddress);
    }
}
