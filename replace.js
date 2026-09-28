const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if(file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let orig = c;
    c = c.replace(/Firststeps Excellence Academy/gi, 'Atlantic Public School');
    c = c.replace(/Firststeps/gi, 'Atlantic');
    c = c.replace(/atlantic2@gmail\.com/gi, 'atlanticpublicschool2015@gmail.com');
    c = c.replace(/8962678915/g, '917987711981');
    c = c.replace(/Atlantic-2/gi, 'Atlantic Public School');
    c = c.replace(/Factory Road, Pinto Park, Gwalior/gi, 'Near Shiv Mandir, Chakra Wali Mata, Road,Pinto Park Gwalior');
    c = c.replace(/Factory Road, Pinto Park/gi, 'Near Shiv Mandir, Chakra Wali Mata, Road,Pinto Park');
    if(orig !== c) {
        fs.writeFileSync(f, c);
        console.log('Updated ' + f);
        changed++;
    }
});
console.log('Total files changed: ' + changed);
