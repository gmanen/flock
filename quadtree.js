class Point {
    constructor(x, y, poly, data) {
        this.x = x
        this.y = y
        this.poly = poly
        this.data = data
    }
}

class Line {
    constructor(point1, point2) {
        this.point1 = point1
        this.point2 = point2
    }

    intersects(line) {
        const x1 = line.point1.x
        const y1 = line.point1.y
        const x2 = line.point2.x
        const y2 = line.point2.y

        const x3 = this.point1.x
        const y3 = this.point1.y
        const x4 = this.point2.x
        const y4 = this.point2.y

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        if (0 === den) {
            return false
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den

        if (!(t > 0 && t < 1 && u > 0)) {
            return false;
        }

        return createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }

    intersectsPoly(poly) {
        const intersects = []

        for (let i = 0; i < poly.length; i++) {
            let intersect = this.intersects(new Line(poly[i], poly[(i + 1) % poly.length]))

            if (false !== intersect) {
                intersects.push(intersect)
            }
        }

        return intersects.length ? intersects : false
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    intersects(circle) {
        let dx = Math.abs(this.x - circle.x)
        let dy = Math.abs(this.y - circle.y)

        const r = circle.r
        const w = this.w
        const h = this.h

        if (dx > (r + w) || dy > (r + h)) {
            return false
        }

        if (dx <= w || dy <= h) {
            return true
        }

        dx = dx - w
        dy = dy - h

        return dx * dx + dy * dy <= r * r
    }

    intersectsLine(line) {
        const nw = createVector(this.x - this.w, this.y - this.h)
        const ne = createVector(this.x + this.w, this.y - this.h)
        const sw = createVector(this.x - this.w, this.y + this.h)
        const se = createVector(this.x + this.w, this.y + this.h)

        return line.intersects(new Line(nw, ne)) || line.intersects(new Line(ne, se)) || line.intersects(new Line(se, sw)) || line.intersects(new Line(sw, nw))
    }

    contains(point) {
        const x = this.x
        const y = this.y
        const w = this.w
        const h = this.h

        return !(point.x >= x + w || point.x <= x - w || point.y <= y - h || point.y >= y + h)
    }
}

class Circle {
    constructor(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
    }

    contains(point) {
        const dx = Math.abs(this.x - point.x)
        const dy = Math.abs(this.y - point.y)

        return dx * dx + dy * dy <= this.r * this.r
    }
}

class Quadtree {
    constructor(x, y, w, h, capacity) {
        this.boundary = new Rectangle(x, y, w, h)
        this.capacity = capacity
        this.points = []
        this.regions = []
    }

    insert(point) {
        if (!this.boundary.contains(point)) {
            return false
        }

        if (!this.subdivided() && this.points.length < this.capacity) {
            this.points.push(point)
            return true
        }

        this.subdivide()

        for (let insertPoint of [...this.points, point]) {
            for (let region of this.regions) {
                if (region.insert(insertPoint)) {
                    break
                }
            }
        }

        this.points = []

        return true
    }

    subdivide() {
        if (this.subdivided()) {
            return
        }

        const x = this.boundary.x
        const y = this.boundary.y
        const w = this.boundary.w / 2
        const h = this.boundary.h / 2

        this.regions.push(new Quadtree(x - w, y - h, w, h, this.capacity))
        this.regions.push(new Quadtree(x + w, y - h, w, h, this.capacity))
        this.regions.push(new Quadtree(x - w, y + h, w, h, this.capacity))
        this.regions.push(new Quadtree(x + w, y + h, w, h, this.capacity))
    }

    query(circle) {
        if (!this.boundary.intersects(circle)) {
            return []
        }

        let results = []

        if (this.subdivided()) {
            for (let region of this.regions) {
                results = results.concat(region.query(circle))
            }

            return results
        }

        for (let point of this.points) {
            if (circle.contains(point)) {
                results.push(point)
            }
        }

        return results
    }

    queryLine(line) {
        if (!this.boundary.intersectsLine(line)) {
            return []
        }

        let results = []

        if (this.subdivided()) {
            for (let region of this.regions) {
                results = results.concat(region.queryLine(line))
            }

            return results
        }

        for (let point of this.points) {
            let intersectingPoints = line.intersectsPoly(point.poly)

            if (false !== intersectingPoints) {
                results = results.concat(intersectingPoints)
            }
        }

        return results
    }

    count() {
        let count = 0

        if (this.subdivided()) {
            for (let region of this.regions) {
                count += region.count()
            }

            return count
        }

        return this.points.length
    }

    subdivided() {
        return this.regions.length > 0
    }

    show() {
        stroke(255)
        strokeWeight(1)
        noFill()
        rectMode(CENTER)
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2)

        if (this.subdivided()) {
            this.regions.map(region => {
                region.show()
            })
        } else {
            text(this.count(), this.boundary.x, this.boundary.y)
        }
    }
}
