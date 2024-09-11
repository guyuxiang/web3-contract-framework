"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDummyContract = void 0;
var generateDummyContract = function (facetList, _a) {
    var spdxIdentifier = _a.spdxIdentifier, solidityVersion = _a.solidityVersion, diamondAddress = _a.diamondAddress, network = _a.network;
    var structs = facetList
        .reduce(function (structsArr, contract) {
        return __spreadArray(__spreadArray([], structsArr, true), getFormattedStructs(contract), true);
    }, [])
        .filter(dedoop);
    var signatures = facetList
        .reduce(function (signaturesArr, contract) {
        return __spreadArray(__spreadArray([], signaturesArr, true), getFormattedSignatures(contract), true);
    }, [])
        .filter(dedoop);
    var str = getContractString({
        spdxIdentifier: spdxIdentifier,
        solidityVersion: solidityVersion,
        diamondAddress: diamondAddress,
        signatures: signatures,
        structs: structs,
        network: network,
    });
    return str;
};
exports.generateDummyContract = generateDummyContract;
var getContractString = function (_a) {
    var spdxIdentifier = _a.spdxIdentifier, solidityVersion = _a.solidityVersion, signatures = _a.signatures, structs = _a.structs, diamondAddress = _a.diamondAddress, network = _a.network;
    return "\n// SPDX-License-Identifier: ".concat(spdxIdentifier || "MIT", "\npragma solidity ").concat(solidityVersion || "^0.8.20", ";\n\n").concat(generateComment(diamondAddress, network), "\n\ncontract DummyDiamondImplementation {\n").concat(structs.reduce(function (all, struct) {
        return "".concat(all, "\n\n").concat(struct);
    }, ""), "\n").concat(signatures.reduce(function (all, sig) {
        return "".concat(all || "    ").concat("\n\n", "   ").concat(sig);
    }, ""), "\n}\n");
};
var getFormattedSignatures = function (facet) {
    var signatures = Object.keys(facet.interface.functions);
    return signatures.map(function (signature) {
        return formatSignature(facet.interface.functions[signature]);
    });
};
var formatSignature = function (func) {
    var paramsString = formatParams(func.inputs);
    var outputStr = formatParams(func.outputs);
    var stateMutability = func.stateMutability === "nonpayable" ? "" : " ".concat(func.stateMutability);
    var outputs = outputStr ? " returns (".concat(outputStr, ")") : "";
    return "function ".concat(func.name, "(").concat(paramsString, ") external").concat(stateMutability).concat(outputs, " {}");
};
var formatParams = function (params) {
    var paramsString = params.reduce(function (currStr, param, i) {
        var comma = i < params.length - 1 ? ", " : "";
        var formattedType = formatType(param);
        var name = param.name ? " ".concat(param.name) : "";
        return "".concat(currStr).concat(formattedType).concat(name).concat(comma);
    }, "");
    return paramsString;
};
var formatType = function (type) {
    var storageLocation = getStorageLocationForType(type.type);
    var arrString = getArrayString(type);
    var formattedType = type.components
        ? getTupleName(type) + arrString
        : type.type;
    return "".concat(formattedType, " ").concat(storageLocation);
};
var getArrayString = function (type) {
    if (!type.arrayLength) {
        return "";
    }
    if (type.arrayLength === -1) {
        return "[]";
    }
    return "[".concat(type.arrayLength, "]");
};
var getStorageLocationForType = function (type) {
    // check for arrays
    if (type.indexOf("[") !== -1) {
        return "memory";
    }
    // check for tuples
    if (type.indexOf("tuple") !== -1) {
        return "memory";
    }
    switch (type) {
        case "bytes":
        case "string":
            return "memory";
        default:
            return "";
    }
};
// deterministic naming convention
var getTupleName = function (param) {
    return "Tuple" + hashCode(JSON.stringify(param));
};
function hashCode(str) {
    var hash = 0;
    for (var i = 0, len = str.length; i < len; i++) {
        var chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString().substring(3, 10);
}
// declare structs used in function arguments
var getFormattedStructs = function (facet) {
    var funcs = Object.values(facet.interface.functions);
    var inputStructs = funcs.reduce(function (inputStructsArr, func) {
        return __spreadArray(__spreadArray([], inputStructsArr, true), getFormattedStructsFromParams(func.inputs), true);
    }, []);
    var outputStructs = funcs.reduce(function (outputStructsArr, func) {
        return __spreadArray(__spreadArray([], outputStructsArr, true), getFormattedStructsFromParams(func.outputs), true);
    }, []);
    return __spreadArray(__spreadArray([], inputStructs, true), outputStructs, true);
};
var getFormattedStructsFromParams = function (params) {
    return params
        .map(recursiveFormatStructs)
        .flat()
        .filter(function (str) { return str.indexOf(" struct ") !== -1; });
};
var recursiveFormatStructs = function (param) {
    // base case
    if (!param.components) {
        return [""];
    }
    var otherStructs = param.components
        .map(recursiveFormatStructs)
        .flat()
        .filter(function (str) { return str.indexOf(" struct ") !== -1; });
    var structMembers = param.components.map(formatStructMember);
    var struct = "    struct ".concat(getTupleName(param), " {").concat(structMembers.reduce(function (allMembers, member) { return "".concat(allMembers).concat(member); }, ""), "\n    }");
    return __spreadArray([struct], otherStructs, true);
};
var formatStructMember = function (param) {
    var arrString = getArrayString(param);
    return "\n        ".concat(param.components ? getTupleName(param) + arrString : param.type, " ").concat(param.name, ";");
};
var dedoop = function (str, index, allmembers) {
    for (var i = 0; i < index; i++) {
        if (allmembers[i] === str) {
            return false;
        }
    }
    return true;
};
var generateComment = function (diamondAddress, network) {
    if (!diamondAddress || !network) {
        return "";
    }
    return "/**\n * This is a generated dummy diamond implementation for compatibility with \n * etherscan. For full contract implementation, check out the diamond on louper:\n * https://louper.dev/diamond/".concat(diamondAddress, "?network=").concat(network, "\n */");
};
